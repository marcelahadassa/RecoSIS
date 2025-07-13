# Usa uma imagem oficial e leve do Python
FROM python:3.9-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia o arquivo de dependências
COPY requirements.txt .

# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto do código
COPY . .

# Comando para executar o nosso consumidor quando o contêiner iniciar
CMD ["python", "consumer.py"]