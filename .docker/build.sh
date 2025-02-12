docker build --platform linux/amd64 -t igrq/flai-back:$1 ./.. -f Dockerfile
docker push igrq/flai-back:$1