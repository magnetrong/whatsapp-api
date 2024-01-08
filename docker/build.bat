docker login
docker buildx create --name mybuilder --use
docker buildx inspect mybuilder --bootstrap
docker buildx build --platform linux/arm64 -t strongtran/whatsapp-server:arm64 --push .