# RecoSIS - Sistema de Recomendação Musical

Um sistema distribuído que oferece recomendações personalizadas de artistas e músicas com base no seu histórico do [Last.fm](https://www.last.fm/).  
Este projeto foi desenvolvido para a disciplina de **Sistemas Distribuídos**.

---

## Como Executar o Projeto?

Este projeto é **100% containerizado com Docker**, então a configuração e execução são muito simples.

### 1. Pré-requisitos

Antes de começar, garanta que você tem o seguinte software instalado na sua máquina:

- **Git:** Para clonar o repositório.
- **Docker e Docker Compose:** Para construir e orquestrar todos os serviços.

> 📝 *Nota: Você **não precisa** instalar Node.js, Python, PostgreSQL ou RabbitMQ diretamente na sua máquina. O Docker cuidará de tudo!*

---

### 2. Clonar o Repositório

Abra um terminal e execute os comandos abaixo:

```bash
# Clone este repositório
git clone https://github.com/marcelahadassa/RecoSIS.git

# Entre na pasta do projeto
cd RecoSIS
```

---

### 3. Configurar as Variáveis de Ambiente

O projeto precisa de algumas chaves secretas para funcionar. Vamos criá-las a partir do arquivo de exemplo.

Na pasta raiz do projeto, execute:

```bash
cp .env.example .env
```

Agora, edite o novo arquivo `.env` com um editor de texto e preencha os valores:

- `JWT_SECRET`: Coloque qualquer frase longa e secreta.  
  Exemplo: `este-e-um-segredo-muito-forte-para-o-jwt`
- `LASTFM_API_KEY`: Cole aqui a sua chave da API do Last.fm.

---

### 4. Construir e Executar a Aplicação

Com tudo configurado, basta um único comando para construir e iniciar todos os serviços do projeto.

> 💡 Certifique-se de que o Docker Desktop está rodando!

No terminal, na raiz do projeto, execute:

```bash
docker compose up --build
```

Este comando pode levar alguns minutos na primeira vez, pois irá baixar imagens e construir os três módulos da aplicação.

---

### Verificando se Tudo Funcionou

Assim que os logs no terminal se estabilizarem, sua aplicação estará pronta:

- Acesse o **Frontend** (RecoSIS):  
 [http://localhost:5173](http://localhost:5173)

- Acesse a **API do Backend**:  
 [http://localhost:3000](http://localhost:3000)

- (Opcional) Acesse o painel do **RabbitMQ**:  
  [http://localhost:15672](http://localhost:15672)  
  Login: `guest`  
  Senha: `guest`

---

### Como Parar a Aplicação?

Para desligar todos os serviços:

1. Vá até o terminal onde o `docker compose up` está rodando.
2. Pressione `Ctrl + C`.

Se quiser parar completamente e remover os containers criados, você pode rodar:

```bash
docker compose down
```

---