<template>
    <div class="chat">
        <div id="messageContainer">
        <div class="messageItem">
          <div class="header">
              <span class="author">TEST</span> <span class="time">00:00</span>
          </div>
          <p>
              Hi there, this is the example
          </p>
        </div>
        <div class="messageItem">
          <div class="header">
              <span class="author">TEST</span> <span class="time">00:00</span>
          </div>
          <p>
              Hi there, this is the example
          </p>
        </div>
        <div class="messageItem">
          <div class="header">
              <span class="author">TEST</span> <span class="time">00:00</span>
          </div>
          <p>
              Hi there, this is the example
          </p>
        </div>
      </div>
    </div>
</template>

<style scoped>
    #messageContainer {
        overflow-y: scroll;
        width: 100%;
    }

    .messageItem {
        width: 80%;
        padding: 20px;
        color: #fff;
        box-sizing: border-box;
        background-color: #333;
        border-radius: 5px;
        margin: 10px;
        float: left;
    }
    .own {
        margin-left: 20%;
        float: left;
        background-color: #fefefe;
        border: 1px solid #eee;
        color: #333;
    }
</style>