// ---------------------------
// Global constants
// ---------------------------
const lookupColorArray = [
  "pink",
  "purple",
  "deep-purple",
  "indigo",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "grey",
  "blue-grey",
];

// ---------------------------
// Logic wrapping classes
// ---------------------------


class ItemPromptModal {
static subElemById(element, id) {
  let t = element.querySelectorAll("#" + id);
  if (t.length > 0) {
    return t[0];
  }
  return null;
}
constructor(id, dataset) {
  this.element = ItemPromptModal.subElemById(document, id);
  this.text = ItemPromptModal.subElemById(this.element, id + "-text");
  this.save = ItemPromptModal.subElemById(this.element, id + "-save");
  this.itemUnderEdit = null;
  this.color = null;
  this.dataset = dataset;
  this.modal = M.Modal.init(this.element, {});
  this.save.addEventListener("click", () => {
    this.updateItem();
  });
  this.text.onkeypress = (event) => {
    const keyCode = event.keyCode;
    if (keyCode === 13) {
      this.updateItem();
      this.modal.close();
    }
  };
}
updateItem() {
  if (this.itemUnderEdit !== null) {
    this.itemUnderEdit.content = this.text.value;
    if ("start" in this.itemUnderEdit) {
      this.itemUnderEdit.start = Date.parse(
        this.itemUnderEdit.start.toString()
      );
    }
    if ("end" in this.itemUnderEdit) {
      this.itemUnderEdit.end = Date.parse(this.itemUnderEdit.end.toString());
    }
    this.dataset.updateOnly(this.itemUnderEdit);
    this.itemUnderEdit = null;
    this.setModalColor();
  }
}
getModalColor() {
  return lookupColorArray[this.itemUnderEdit.group-1];
}
setModalColor() {
  lookupColorArray.forEach((c)=>{
    this.element.classList.remove(c)
    this.element.querySelectorAll(".btn").forEach((e)=>{
        e.classList.remove(c);
      });
    this.color = null;  
  })
  if (this.itemUnderEdit !== null) {
    let color = this.getModalColor();
    this.element.classList.add(color);
    this.element.querySelectorAll(".btn").forEach((e)=>{
        e.classList.add(color);
      });
  }
  
  console.log(this.color);
}
editItem(item) {
  this.itemUnderEdit = item;
  this.setModalColor();
  this.text.value = item.content;
  this.modal.open();
  this.text.focus();
  this.text.select();
}
}
class GroupPromptModal extends ItemPromptModal {
constructor(id, dataset) {
  super(id, dataset);
  this.del = ItemPromptModal.subElemById(this.element, id + "-del");
  this.del.addEventListener("click", () => {
    this.dataset.remove(this.itemUnderEdit.id);
  });
}
getModalColor() {
  return lookupColorArray[this.itemUnderEdit.id-1];
}
}
class TimelineWrapper {
static addClassNamesToGroups(groups) {
  groups.forEach((g) => {
    g.className = lookupColor(g.id - 1);
  });
}
constructor() {
  this.groups = new vis.DataSet();
  this.items = new vis.DataSet();
  this.itemModal = new ItemPromptModal("item-prompt-modal", this.items);
  this.groupModal = new GroupPromptModal("group-prompt-modal", this.groups);
  let container = document.getElementById("visualization");
  this.options = {
    editable: true, // default for all items
    zoomable: false,
    horizontalScroll: true,
    snap: null,
    groupTemplate: function(grp) {
      let elem = document.createElement("a");
      "waves-effect waves-light lighten-2 btn".split(' ').forEach(
        (c)=>elem.classList.add(c)
      );
      elem.classList.add(lookupColorArray[grp.id-1]);
      elem.classList.add();
      elem.innerHTML = grp.content;
      return elem;
    },
    groupEditable: {
      add: true, remove: true, order: true},
    format: {
      minorLabels: {
        millisecond: "SSS",
        second: "s",
        minute: "HH:mm",
        hour: "HH:mm",
        weekday: "[Day] D",
        day: "[Day] D",
        week: "w",
        month: "[Month] M",
        year: "[Year] YY",
      },
      majorLabels: {
        millisecond: "HH:mm:ss",
        second: "D MMMM HH:mm",
        minute: "ddd D MMMM",
        hour: "ddd D MMMM",
        weekday: "[Month] M [Year] YY",
        day: "[Month] M [Year] YY",
        week: "[Month] M [Year] YY",
        month: "[Year] YY",
        year: "",
      },
    },
    template: function (item, element, data) {
      element.classList.add(lookupColorArray[item.group - 1]);
      element.classList.add("white-text");
      element.classList.add("lighten-2");
      return item.content;
    },
  };
  this.timeline = new vis.Timeline(
    container,
    this.items,
    this.groups,
    this.options
  );
  this.timeline.on("doubleClick", (e) => {
    switch (e.what) {
      case "item":
        if (e.item !== null) {
          let item = this.items.get(e.item);
          this.itemModal.editItem(item);
        }
        break;
      case "group-label":
        if (e.group !== null) {
          let group = this.groups.get(e.group);
          M.toast({ html: "Viewing " + group.content + "!"});
          this.groups.forEach((group_i)=>{
            group_i.visible = (group_i.id == group.id)
            this.groups.update(group_i);
          })
        }
      default:
    }
  });
}
clear() {
  this.groups.clear();
  this.items.clear();
}
loadData(data) {
  this.items.clear();
  this.items.add(data.items);
  this.groups.clear();
  this.groups.add(data.groups);
}
saveData() {
  let itemdata = this.items.get({
    fields: ["id", "start", "content", "group"], // output the specified fields only
    type: {
      start: "Date", // convert the date fields to Date objects
      content: "String",
      group: "int", // convert the group fields to Strings
    },
  });
  let groupdata = this.groups.get({
    fields: ["id", "content", "order"], // output the specified fields only
    type: {
      order: "int",
      id: "int", // convert the date fields to Date objects
      content: "String", // convert the group fields to Strings
    },
  });
  return { groups: groupdata, items: itemdata };
}
addGroup() {
  let newid = 1;
  let newindex = 1;
  if (this.groups.length > 0) {
    newid = this.groups.max("id").id + 1;
  }
  if (this.groups.length > 0) {
    newindex = this.groups.max("order").order + 1;
  }
  this.groups.add({ id: newid, content: "person_" + newid, visible: true, order: newindex });
}
}

// ---------------------------
// Declares
// ---------------------------
const timelineWrapper = new TimelineWrapper();

// ---------------------------
// Listeners
// ---------------------------

document.getElementById("edit-btn-char").addEventListener("click", () => {
timelineWrapper.addGroup();
M.toast({ html: "New character added!" });
});
document.getElementById("edit-btn-zoom-in").addEventListener("click", () => {
timelineWrapper.timeline.zoomIn(0.2);
});
document.getElementById("edit-btn-zoom-out").addEventListener("click", () => {
timelineWrapper.timeline.zoomOut(0.2);
});
document.getElementById("edit-btn-clear").addEventListener("click", () => {
timelineWrapper.clear();
M.toast({ html: "Clearing all items!" });
});
document.getElementById("edit-btn-clear").addEventListener("click", () => {
timelineWrapper.clear();
M.toast({ html: "Clearing all items ()!" });
});
document.getElementById("edit-btn-reset").addEventListener("click", () => {
timelineWrapper.groups.forEach((group_i)=>{
            group_i.visible = true;
            timelineWrapper.groups.update(group_i);
          })
timelineWrapper.timeline.fit(6000);
});

document.getElementById("footer-btn-load").addEventListener("click", () => {
let itemdata = JSON.parse(localStorage.getItem("itemdata")).filter(
  (d) => d.id !== null && d.start !== null
);
let groupdata = JSON.parse(localStorage.getItem("groupdata")).filter(
  (d) => d.id !== null && d.start !== null
);
timelineWrapper.loadData({ groups: groupdata, items: itemdata });
M.toast({ html: "Loading data!" });
timelineWrapper.timeline.fit(6000);
});

document.getElementById("footer-btn-download").addEventListener("click", () => {
M.toast({ html: "Loading data!" });
filename = "timeline.json"
const data = JSON.stringify(timelineWrapper.saveData(), null, 2);
const blob = new Blob([data], {type: 'text/json'});
const elem = window.document.createElement('a');
elem.href = window.URL.createObjectURL(blob);
elem.download = filename;        
document.body.appendChild(elem);
elem.click();        
document.body.removeChild(elem);
});