// NODES

Node.prototype.add = function (nodes) {
    if (nodes instanceof NodeList)
        nodes.forEach(node => this.appendChild(node))
    else if (nodes instanceof Array) {
        nodes.forEach(node => {
            if (node instanceof Node) this.appendChild(node)
        })
    } else if (nodes instanceof Node)
        this.appendChild(nodes)
    return this
}

Node.prototype.sub = function (nodes) {
    if (nodes instanceof NodeList)
        nodes.forEach(node => this.removeChild(node))
    else if (nodes instanceof Array) {
        nodes.forEach(node => {
            if (node instanceof Node) this.removeChild(node)
        })
    } else if (nodes instanceof Node)
        this.removeChild(nodes)
    else if (typeof nodes == "number")
        this.removeChild(this.childNodes[nodes])
    return this
}

Node.prototype.on = function (event, func) {
    this.addEventListener(event, func)
    if (!this.__events)
        this.__events = {}
    if (!this.__events[event])
        this.__events[event] = []
    this.__events[event].push(func)
    return this
}

Node.prototype.off = function (event, func) {
    if (event == undefined)
        return
    if (func == undefined)
        (this.__events[event] || []).forEach(func => this.removeEventListener(event, func))
    this.removeEventListener(event, func)
    return this
}

Node.prototype.createBindList = function (interpreter, filter = () => true) {
    let list = [], fullList = []
    const set = (newList, filter) => {
        filteredList = newList.filter(filter)

        const difference = Array.difference(list, filteredList)
        const linkedDifference = {}

        linkedDifference.remove = difference.remove.map(i => this.childNodes[i])
        linkedDifference.add = difference.add.map(i => [i, interpreter(filteredList[i])])
        linkedDifference.move = difference.move.map(x => [x[1], this.childNodes[x[0]]])

        linkedDifference.remove.forEach(el => this.removeChild(el))
        linkedDifference.add.forEach(obj => {
            this.insertBefore(obj[1], this.childNodes[obj[0]])
        })
        linkedDifference.move.forEach(obj => {
            this.insertBefore(obj[1], this.childNodes[obj[0]])
        })

        list = filteredList
        fullList = newList
    }
    Object.defineProperty(this, "bindList", {
        get: function () {
            return fullList.concat()
        },
        set: function (newList) {
            set(newList, filter)
        }
    })
    this.filter = (func) => {
        set(fullList, func || filter)
    }
    return this
}

Node.create = function (type, attr = {}, innerHTML) {
    let element = document.createElement(typeof type == "string" ? type : "div")
    if (typeof type == "object") attr = type
    if (attr && typeof attr !== "object") element.innerHTML = attr
    else for (let a in attr) element.setAttribute(a, attr[a])
    if (innerHTML != undefined) element.innerHTML = innerHTML
    return element
}

// DATE

Date.prototype.addTime = function (time) {
    time = "" + time
    var t = time.replace(parseFloat(time), "")
    if (t) t = t.toLowerCase()
    time = parseFloat(time)
    switch (t) {
        case "h":
            time *= 1000 * 60 * 60
            break
        case "min":
            time *= 1000 * 60
            break
        case "s":
            time *= 1000
            break
    }
    this.setTime(this.getTime() + time)
    return this
}

// Array

Array.difference = function (oldA, newA) {
    newA = newA.concat()
    let difference = { remove: [], move: [], add: [] }
    for (let i = 0; i < oldA.length; i++) {
        let index = newA.indexOf(oldA[i])
        if (index == -1) {
            difference.remove.push(i)
        } else if (index != i) {
            difference.move.push([i, index]) // [old index, new index]
            newA[index] = undefined
        } else {
            newA[index] = undefined
        }
    }
    for (let i = 0; i < newA.length; i++) {
        if (newA[i] != undefined) {
            difference.add.push(i)
        }
    }
    return difference
}

const app = document.getElementById("app"),
    filter = document.getElementById("filter")

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
    app.filter(x => x % e.target.value == 0)
})