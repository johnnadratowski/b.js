# B.js

B is for people who are looking for:

1. No build times
2. No large frameworks
3. Readable yet Expressive code
4. Reusable components
5. Server side rendering
...


B was built because of:

1. Dependency hell using frameworks in JS
2. Huge build times
3. Code Readability
...


## Add New Example

1. Add to exampleList
2. Add files

```bash
# Creating new example from previous
cp -r ./simple-reactive ./reactive-list
for f in simple-reactive.*; do
    ext="${f##*.}"
    mv "$f" "reactive-list.$ext"
done
# To clear them out
echo "" > ./*
```


## TODO

* Optionally not render elem using reactive
* Recurse Var - Add NodeList, Map, Set support?
* Cleanup els in Reactive
* Custom Events/custom elements
* Reactive tests