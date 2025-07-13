# Usa uma imagem oficial do Node.js como base
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de gerenciamento de dependências
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o resto do código da aplicação para o diretório de trabalho
COPY . .

# Expõe a porta que a aplicação vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação quando o container for executado
CMD [ "node", "src/server.js" ]