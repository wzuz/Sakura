import config from "../../config"

register("chat", (message) => {
  if (!config.helloTrigger) return;
  if (message.toLowerCase().includes("hi")) {
    ChatLib.chat("&dHello from Sakura!")
  }
}).setCriteria("${message}")
