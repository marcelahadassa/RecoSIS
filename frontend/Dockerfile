# Usamos uma imagem base do Node.js v20, que é compatível com o Vite
FROM node:20-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os ficheiros de gerenciamento de pacotes
# O * garante que ele copie tanto o package.json quanto o package-lock.json
COPY package*.json ./

# Instala todas as dependências do projeto
RUN npm install

# Copia o resto do código do seu frontend para dentro do contêiner
COPY . .

# Expõe a porta padrão do Vite para que possamos acedê-la
EXPOSE 5173

# O comando para iniciar o servidor de desenvolvimento
# O '--host' é crucial para que o Vite seja acessível de fora do contêiner
CMD ["npm", "run", "dev", "--", "--host"]