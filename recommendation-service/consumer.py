import pika
import time
import os
import json
import requests
import psycopg2
from psycopg2 import extras
import sys
import random

# --- CONFIGURAÇÕES ---
LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY')
LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/'
DB_CONN_STRING = f"dbname='recommendation_db' user='admin' host='postgres-db' password='admin'"

# --- FUNÇÕES DE LÓGICA ---

def get_artist_recommendations(username):
    # busca 10 artistas aleatórios de um pool de similares
    if not LASTFM_API_KEY: raise ValueError("Chave da API não configurada.")
    print(f"Buscando recomendações de ARTISTAS para: {username} (Modo Descoberta)", flush=True)
    
    params_top = {
        'method': 'user.gettopartists', 'user': username, 'api_key': LASTFM_API_KEY,
        'format': 'json', 'limit': 10, 'period': '3month'
    }
    response_top = requests.get(LASTFM_API_URL, params=params_top)
    response_top.raise_for_status()
    top_artists = response_top.json().get('topartists', {}).get('artist', [])

    if not top_artists:
        print(f"Nenhum artista encontrado para o usuário '{username}'.", flush=True)
        return []

    similar_artists_pool = set()
    user_top_artists_names = {a['name'].lower() for a in top_artists}

    for artist in top_artists:
        print(f"  - Expandindo com artistas similares a: {artist['name']}", flush=True)
        params_similar = {'method': 'artist.getsimilar', 'artist': artist['name'], 'api_key': LASTFM_API_KEY, 'format': 'json', 'limit': 3}
        sim_response = requests.get(LASTFM_API_URL, params=params_similar)
        if sim_response.status_code == 200:
            for sim_artist in sim_response.json().get('similarartists', {}).get('artist', []):
                if sim_artist['name'].lower() not in user_top_artists_names:
                    similar_artists_pool.add(sim_artist['name'])
    
    if not similar_artists_pool:
        print("Pool de artistas similares vazio, nenhuma recomendação gerada.", flush=True)
        return []
        
    # garante que o sorteio não irá exceder mais do que o número de artistas disponíveis
    sample_size = min(10, len(similar_artists_pool))
    
    # sorteio de 10 (ou menos) artistas dos similares
    final_recs = random.sample(list(similar_artists_pool), sample_size)
    print(f"Recomendações de artistas sorteadas: {len(final_recs)}", flush=True)
    return final_recs

def get_song_recommendations(username):
    # sorteio de 1 música do top 10 de cada artista recomendado
    if not LASTFM_API_KEY: raise ValueError("Chave da API não configurada.")
    print(f"Buscando recomendações de MÚSICAS para: {username} (Modo Descoberta)", flush=True)

    recommended_artists = get_artist_recommendations(username)
    if not recommended_artists:
        print("Não foi possível gerar recomendações de artistas, portanto, não há base para músicas.", flush=True)
        return []
    
    song_recommendations = set()
    print("  - Garimpando músicas dos artistas sorteados...", flush=True)
    for artist_name in recommended_artists:
        params_tracks = {'method': 'artist.gettoptracks', 'artist': artist_name, 'api_key': LASTFM_API_KEY, 'format': 'json', 'limit': 10}
        response_tracks = requests.get(LASTFM_API_URL, params=params_tracks)
        if response_tracks.status_code == 200:
            top_tracks = response_tracks.json().get('toptracks', {}).get('track', [])
            if top_tracks:
                # sorteio de uma música do top 10 do artista
                chosen_track = random.choice(top_tracks)
                song_recommendations.add(f"{chosen_track['name']} - {chosen_track['artist']['name']}")
    
    if not song_recommendations:
        print("Nenhuma música candidata encontrada.", flush=True)
        return []

    # filtro para garantir que músicas já ouvidas pelo usuário não sejam recomendadas
    print(f"Buscando histórico de {username} para refinar a lista de músicas...", flush=True)
    params_history = {'method': 'user.gettoptracks', 'user': username, 'api_key': LASTFM_API_KEY, 'format': 'json', 'limit': 200, 'period': 'overall'}
    history_response = requests.get(LASTFM_API_URL, params=params_history)
    history_response.raise_for_status()
    user_tracks = history_response.json().get('toptracks', {}).get('track', [])
    user_history_names = {f"{t['name']} - {t['artist']['name']}".lower() for t in user_tracks}

    final_recommendations = [song for song in song_recommendations if song.lower() not in user_history_names]

    print(f"Recomendações de músicas encontradas: {len(final_recommendations)}", flush=True)
    return final_recommendations

def save_recommendations_to_db(user_id, recommendations, item_type):
    with psycopg2.connect(DB_CONN_STRING) as db_conn:
        with db_conn.cursor() as cursor:
            sql_delete = 'DELETE FROM "Recommendations" WHERE "userId" = %s AND "item_type" = %s'
            cursor.execute(sql_delete, (user_id, item_type))
            if recommendations:
                insert_data = [(user_id, item, item_type) for item in recommendations]
                sql_insert = 'INSERT INTO "Recommendations" ("userId", "item_name", "item_type", "createdAt", "updatedAt") VALUES %s'
                psycopg2.extras.execute_values(cursor, sql_insert, insert_data, template='(%s, %s, %s, NOW(), NOW())')
                print(f"{len(recommendations)} recomendações do tipo '{item_type}' salvas para o userId {user_id}.", flush=True)

# --- FUNÇÃO PRINCIPAL DO CONSUMIDOR ---

def main():
    rabbitmq_url = os.environ.get('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
    connection = None
    while not connection:
        try:
            connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
            print("Conectado ao RabbitMQ!", flush=True)
        except pika.exceptions.AMQPConnectionError:
            print("Falha ao conectar. Tentando novamente em 5 segundos...", flush=True)
            time.sleep(5)

    channel = connection.channel()
    channel.queue_declare(queue='recommendation_queue', durable=True)

    def callback(ch, method, properties, body):
        print("\n[x] Mensagem recebida!", flush=True)
        message_data = json.loads(body)
        user_id = message_data.get('userId')
        lastfm_username = message_data.get('lastfm_username')
        rec_type = message_data.get('type', 'artists')
        try:
            recs = []
            if rec_type == 'songs':
                recs = get_song_recommendations(lastfm_username)
                if not recs:
                    print(f"Fallback ativado: não foram encontradas músicas. Buscando artistas para {lastfm_username}", flush=True)
                    recs = get_artist_recommendations(lastfm_username)
                    rec_type = 'artists'
            else:
                recs = get_artist_recommendations(lastfm_username)
            if recs:
                save_recommendations_to_db(user_id, recs, rec_type)
            else:
                print(f"Nenhuma recomendação (nem de fallback) encontrada para o usuário {lastfm_username}", flush=True)
            print("[x] Trabalho concluído com sucesso.", flush=True)
        except Exception as e:
            print(f"[!] Erro ao processar a mensagem: {e}", flush=True)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(queue='recommendation_queue', on_message_callback=callback)
    print(' [*] Aguardando por mensagens. Para sair, pressione CTRL+C', flush=True)
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrompido', flush=True)
        sys.exit(0)