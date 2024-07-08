. ./scripts/common.sh

INSPECT=''
if [[ ${DEBUG} != "" ]]; then
  INSPECT=${DEBUG}
fi

nodemon -V -d 1 -i "${OUT_DIR}" -i "**/examples/server/*.js" -i "./b.js"  -i "**/*.map" -i "**/BUILD" --watch . -e pug,sh,less,js,mjs  --exec "yarn build"&
nodemon -V -d 1 -i "${OUT_DIR}" --watch . -e ts  --exec "yarn run tsc"&
sleep 2
nodemon -d 1 --watch "./.env" --watch "./examples/index.js" --watch "./examples/server/**/*.js" --watch "./scripts" ${INSPECT} &

wait