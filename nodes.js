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
    this.hasBindList = true
    return this
};

(function () {

    const tags = [], creators = []

    Node.create = function (type, attr = {}, innerHTML) {
        if (type != undefined && tags.indexOf(type) != -1) {
            Array.prototype.shift.apply(arguments)
            return creators[tags.indexOf(type)](...arguments)
        } else {
            let element = document.createElement(typeof type == "string" ? type : "div")
            if (typeof type == "object") attr = type
            if (attr && typeof attr !== "object") element.innerHTML = attr
            else for (let a in attr) element.setAttribute(a, attr[a])
            if (innerHTML != undefined) element.innerHTML = innerHTML
            return element
        }
    }

    Node.define = function (tag, creator) {
        if (!tag || !creator)
            throw new Error(`Can't define ${tag}!`)
        if (tags.indexOf(tag) != -1)
            throw new Error(`Node ${tag} is already defined!`)
        tags.push(tag)
        creators.push((args) => {
            let c = creator(args)
            c.className = tag
            return c
        })
    }

})()

Node.selectElement = "ELEMENT"
Node.selectComment = "COMMENT"

Node.prototype.select = function (filter, show = "ELEMENT") {
    if (typeof filter == "string") {
        return this.querySelectorAll(filter)
    } else if (typeof filter == "function") {
        let nodeIterator = document.createNodeIterator(this, NodeFilter["SHOW_" + show], {
            acceptNode: (node) => filter(node) == true ? NodeFilter.FILTER_ACCEPT : null
        })
        let node, list = {}, i = 0
        while (node = nodeIterator.nextNode()) {
            list[i] = { value: node }
            i++
        }
        list.length = { value: i }
        list.item = {
            "value": function (i) {
                return this[i || 0];
            }
        }
        return Object.create(document.createDocumentFragment().childNodes, list)
    }
}

// NODE LIST

Object.defineProperty(NodeList.prototype, "style", {
    set: function (style) {
        for (var el = 0; el < this.length; el++)
            for (var property in style) {
                if (typeof style[property] == "function") {
                    this[el].style[property] = style[property](this[el].style[property])
                } else {
                    this[el].style[property] = style[property]
                }
            }
    }
})

Object.defineProperty(NodeList.prototype, "commonParent", {
    get: function () {
        if (this.length == 0) return false
        let parent = this[0].parentNode
        if (this.length == 1) return parent
        for (let i = 0; i < this.length; i++) {
            if (parent != this[i].parentNode) return false
        }
        return parent
    }
})

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