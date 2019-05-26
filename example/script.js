const app = document.getElementById("app"),
  filter = document.getElementById("filter")

document.getElementById("example_filter").on("click", () => {
  app.createBindList(x =>
    Node.create("div", { class: "cli" }, x).on("click", function () {
      app.filter(x => x % this.innerHTML == 0)
      filter.value = this.innerHTML
    })
  )
  let list = []
  for (let i = 0; i < 10000; i++) {
    list.push(i)
  }
  app.bindList = list

  filter.on("keyup", (e) => {
    app.filter(x => x % (e.target.value || 1) == 0)
  })
})

document.getElementById("example_node").on("click", () => {
  Node.define("element", (obj) =>
    Node.create()
      .add(Node.create("div", obj.name))
  )

  app.createBindList(x =>
    Node.create("element", x)
  )
  app.bindList = [{
    name: "foo",
  }, {
    name: "baz",
  }, {
    name: "bar",
  }]
})

document.getElementById("json").on("keyup", (e) => {
  try {
    app.bindList = JSON.parse(e.target.value)
  } catch (error) { }
})
document.getElementById('example_filter').click()