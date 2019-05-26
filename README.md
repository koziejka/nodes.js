# nodes.js
Old project, lib written to make my early school projects faster.  

Dom manipulation lib designed to as with simple tempting engine in mind with minimal abstraction cost.
`.add` `.sub`
  
Adding some basic JQuery features like simplified event handling `.on` `.off`

```javascript
const app = document.getElementById('app')
app.createBindList(x =>
  Node.create("div", { class: "cli" }, x).on("click", function () {
    app.filter(x => x % this.innerHTML == 0)
  })
)
```

Designed to work with pure js elements.

```javascript
document.getElementById('test').on('click', () => {})
```