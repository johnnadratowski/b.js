. ./scripts/common.sh

if [[ "$TSC" == "1" ]]; then
  echo "CLEAN TSC"
  rm -rf ./b.js
  rm -rf ./b.js.map
  rm -rf ./examples/server/**/*.map
  rm -rf ./examples/server/**/*.js
fi
rm -rf ${OUT_DIR}
