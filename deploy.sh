docker build -t prasunmax/multi-client:latest -t prasunmax/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t prasunmax/multi-server:latest -t prasunmax/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t prasunmax/multi-worker:latest -t prasunmax/multi-worker:$SHA -f ./worker/Dockerfile ./worker

docker push prasunmax/multi-client:latest
docker push prasunmax/multi-client:$SHA
docker push prasunmax/multi-server:latest
docker push prasunmax/multi-server:$SHA
docker push prasunmax/multi-worker:latest
docker push prasunmax/multi-worker:$SHA

kubectl apply -f k8s

kubectl set image deployments/server-deployment server=prasunmax/multi-server:$SHA
kubectl set image deployments/client-deployment client=prasunmax/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=prasunmax/multi-worker:$SHA