. ./scripts/common.sh

if [[ "${PRE_COMMIT}" == "" ]]; then
  if [[ "${DEV}" == "1" ]]; then
    if [[ "${CERT_DIR}" == "" ]]; then
      curl -k http://localhost:${PORT:-8010}/pauseLR/ || {
        echo "Could not pause LiveReload"
      }
    else
      curl -k https://localhost:${PORT:-8010}/pauseLR/ || {
        echo "Could not pause LiveReload"
      }
    fi
  fi
fi

yarn clean
mkdir ./${OUT_DIR} 2> /dev/null
cp -r ./examples/pages/* ./${OUT_DIR}

if [[ "${DEV}" == "1" ]]; then
  pug -P -b ${OUT_DIR} ${OUT_DIR}
else
  pug -b ${OUT_DIR} ${OUT_DIR}
fi

for file in $(find ./${OUT_DIR} -name "*.less"); do 
  lessc --include-path=./${OUT_DIR} "$file" "${file%.less}.css"; 
done

if [[ "${PRE_COMMIT}" == "" ]]; then
  echo "$(date)" > ./BUILD

  if [[ "${DEV}" == "1" ]]; then
    if [[ "${CERT_DIR}" == "" ]]; then
      curl -k http://localhost:${PORT:-8010}/startLR/ || {
        echo "Could not unpause LiveReload"
      }
    else
      curl -k https://localhost:${PORT:-8010}/startLR/ || {
        echo "Could not unpause LiveReload"
      }
    fi
  fi
fi