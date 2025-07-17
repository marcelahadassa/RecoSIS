import pika
import time
import os
import json
import requests
import psycopg2
from psycopg2 import extras
import sys

# --- CONFIGURAÇÕES ---
# Pega a chave da API das variáveis de ambiente que definimos no docker-compose
LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY')
LASTFM_API_URL = 'http://ws.audioscrobbler.com/2.0/'
# String de conexão com o banco. Note que o host é 'postgres-db', o nome do serviço no docker-compose.
DB_CONN_STRING = f"dbname='recommendation_db' user='admin' host='postgres-db' password='admin'"

# --- FUNÇÕES DE LÓGICA ---

def get_recommendations_from_lastfm(username):
    """Busca recomendações na API do Last.fm."""
    if not LASTFM_API_KEY:
        raise ValueError("A chave da API do Last.fm não foi configurada.")

    print(f"Buscando recomendações para o usuário: {username}", flush=True)
    
    # 1. Obter os top 5 artistas do usuário
    params_top = {
        'method': 'user.gettopartists', 'user': username, 'api_key': LASTFM_API_KEY,
        'format': 'json', 'limit': 5
    }
    response_top = requests.get(LASTFM_API_URL, params=params_top)
    response_top.raise_for_status()
    top_artists = response_top.json().get('topartists', {}).get('artist', [])

    if not top_artists:
        print(f"Nenhum artista encontrado para o usuário '{username}'.", flush=True)
        return []

    # 2. Para cada top artista, buscar artistas similares
    recommendations = set()
    user_top_artists_names = {artist['name'].lower() for artist in top_artists}

    for artist in top_artists:
        print(f"  - Buscando artistas similares a: {artist['name']}", flush=True)
        params_similar = {
            'method': 'artist.getsimilar', 'artist': artist['name'], 'api_key': LASTFM_API_KEY,
            'format': 'json', 'limit': 5
        }
        sim_response = requests.get(LASTFM_API_URL, params=params_similar)
        
        if sim_response.status_code != 200:
            continue # Pula para o próximo artista se houver erro

        similar_artists = sim_response.json().get('similarartists', {}).get('artist', [])
        for sim_artist in similar_artists:
            # Adiciona apenas se não for um dos artistas que o usuário já ouve muito
            if sim_artist['name'].lower() not in user_top_artists_names:
                recommendations.add(sim_artist['name'])
    
    final_recs = list(recommendations)
    print(f"Recomendações encontradas: {final_recs}", flush=True)
    return final_recs

def save_recommendations_to_db(user_id, recommendations):
    """Salva a lista de recomendações no banco de dados."""
    with psycopg2.connect(DB_CONN_STRING) as db_conn:
        with db_conn.cursor() as cursor:
            # Primeiro, apaga recomendações antigas para este usuário
            cursor.execute('DELETE FROM "Recommendations" WHERE "userId" = %s', (user_id,))
            print(f"Recomendações antigas do userId {user_id} apagadas.", flush=True)
            
            # Prepara os dados para inserção em lote
            if recommendations:
                insert_data = [(user_id, artist) for artist in recommendations]
                psycopg2.extras.execute_values(
                    cursor,
                    'INSERT INTO "Recommendations" ("userId", artist_name, "createdAt", "updatedAt") VALUES %s',
                    insert_data,
                    template='(%s, %s, NOW(), NOW())'
                )
                print(f"{len(recommendations)} recomendações salvas para o userId {user_id}.", flush=True)

# --- FUNÇÃO PRINCIPAL DO CONSUMIDOR ---

def main():
    rabbitmq_url = os.environ.get('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
    
    connection = None
    # --- INÍCIO DA PARTE OMITIDA 1 ---
    while not connection:
        try:
            # Tenta se conectar ao RabbitMQ
            connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
            print("Conectado ao RabbitMQ!", flush=True)
        except pika.exceptions.AMQPConnectionError:
            print("Falha ao conectar. Tentando novamente em 5 segundos...", flush=True)
            time.sleep(5)
    # --- FIM DA PARTE OMITIDA 1 ---

    channel = connection.channel()

    # Garante que a fila existe, a mesma que a API usa
    channel.queue_declare(queue='recommendation_queue', durable=True)

    # Função que será executada toda vez que uma mensagem chegar
    def callback(ch, method, properties, body):
        print("\n[x] Mensagem recebida!", flush=True)
        message_data = json.loads(body)
        user_id = message_data.get('userId')
        lastfm_username = message_data.get('lastfm_username')
        
        try:
            recs = get_recommendations_from_lastfm(lastfm_username)
            if recs:
                save_recommendations_to_db(user_id, recs)
            print("[x] Trabalho concluído com sucesso.", flush=True)
        except Exception as e:
            print(f"[!] Erro ao processar a mensagem: {e}", flush=True)
        
        ch.basic_ack(delivery_tag=method.delivery_tag)

    # --- INÍCIO DA PARTE OMITIDA 2 ---
    # Diz ao RabbitMQ para chamar nossa função 'callback' quando houver mensagens
    channel.basic_consume(queue='recommendation_queue', on_message_callback=callback)

    print(' [*] Aguardando por mensagens. Para sair, pressione CTRL+C', flush=True)
    channel.start_consuming()
    # --- FIM DA PARTE OMITIDA 2 ---

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrompido')
        sys.exit(0)