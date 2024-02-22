<template>
    <div id="chatPage">
        <div class="left">
            <!-- Conversation List -->
            <div class="conversation-list">
                <div class="conversation">
                    <div class="conversation-header">
                        <span class="date pointer">2023-11-15</span>
                        <Edit class="pointer" width="16"></Edit>
                        <Delete class="pointer" width="16"></Delete>
                    </div>
                </div>

                <div class="conversation-add pointer flx-center ">
                    <Plus width="16"></Plus>
                </div>
                <!-- Add more conversations as needed -->
            </div>
        </div>
        <div class="right">
            <!-- Chat Interface -->
            <div class="chat-list">
                <div :class='["chat-item", item.type == "response" ? "response" : "question"]' v-for="item in  chats ">
                    <div class="avatar">
                        <img :src='item.type == "response" ? avatar : sysImg' alt="">
                    </div>
                    <div class="chat-body">
                        <p class="text"> {{ item.txt }}</p>
                        <p class="handle">
                            <Refresh class="pointer" width="16" />
                            <Delete class="pointer" width="16" />
                        </p>
                    </div>
                </div>
            </div>
            <form>
                <div class="textarea-container">
                    <textarea name="" id="sendTxt" cols="20" rows="2" v-model="input"></textarea>
                    <label for="sendTxt" class="placeholder">请输入文本</label>
                </div>
                <Position width="24" id="sendBtn" @click="sendQuestion">发送</Position>
            </form>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { reactive, ref } from 'vue';
import avatar from "@/assets/images/avatar.gif"
import sysImg from "@/assets/images/logo.png"
import { ElMessage } from 'element-plus';

const input = ref('')

const chats = reactive<ChatInfo[]>([{
    time: 1655280245811,
    txt: "非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完非常抱歉,我的数据没有做完",
    type: "response"
}, {
    time: 1655280205811,
    txt: "发回去重做啊!",
    type: "send"
},
{
    time: 1655280245811,
    txt: "非常抱歉,我的数据没有做完",
    type: "response"
}, {
    time: 1655280205811,
    txt: "发回去重做啊!",
    type: "send"
},
{
    time: 1655280245811,
    txt: "非常抱歉,我的数据没有做完",
    type: "response"
}, {
    time: 1655280205811,
    txt: "发回去重做啊!",
    type: "send"
}, {
    time: 1655280245811,
    txt: "非常抱歉,我的数据没有做完",
    type: "response"
}, {
    time: 1655280205811,
    txt: "发回去重做啊!",
    type: "send"
}])

const sendQuestion = (e) => {
    const content = input.value
    input.value = "";
    console.log('提交了内容', content)
}

// const selected = localStorage.getItem('selectedids') ? JSON.parse(localStorage.getItem('selectedids')) : [];

// navigator.clipboard.writeText(JSON.stringify(selected)).then(()=>{ElMessage.error('写入欧克！')})

</script>

<style scoped lang='scss'>
#chatPage {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to right bottom, #f0b5d7, #e5b4de, #d7b4e5, #c7b5ea, #b5b6ed, #a6bdf5, #96c4fa, #86cbfc, #79d9ff, #73e7ff, #76f3fe, #85fff7);
    display: flex;

    .left {
        width: 200px;
        padding: 20px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        border-right: 1px solid #ccc;

        // Conversation List Styles
        .conversation-list {
            overflow-y: auto;
            max-height: calc(100vh - 100px);
            /* Adjust max height as needed */
            margin-bottom: 20px;

            .conversation {
                border: 1px solid #ccc;
                margin-bottom: 10px;
                padding: 10px;
                position: relative;

                .conversation-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .date {
                        font-weight: bold;
                    }

                    .edit-btn,
                    .delete-btn {
                        margin-left: 10px;
                    }
                }

                .conversation-body {
                    /* Conversation Content Styles */
                }

                .custom-button {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    padding: 5px 10px;
                    background-color: #4caf50;
                    color: #fff;
                    border: none;
                    cursor: pointer;

                    &:hover {
                        background-color: #45a049;
                    }
                }
            }
        }

        // Fixed at the bottom
        .bottom-conversation {
            position: absolute;
            bottom: 0;
            width: 100%;

            input {
                width: calc(100% - 10px);
                margin-bottom: 10px;
            }

            button {
                width: 100%;
                padding: 10px;
                background-color: #4caf50;
                color: #fff;
                border: none;
                cursor: pointer;

                &:hover {
                    background-color: #45a049;
                }
            }
        }
    }

    .right {
        flex: 1;
        padding: 20px;

        overflow-y: auto;
        display: flex;
        flex-direction: column;

        // Chat Interface Styles
        .chat-list {
            overflow-y: auto;
            flex: 1;
            /* Adjust max height as needed */

            .chat-item {
                margin-bottom: 10px;
                padding: 10px;
                display: flex;
                overflow: hidden;
                user-select: none;

                img {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    margin: 0 20px;
                }


                .chat-body {
                    padding: 10px 14px;
                    margin-top: 10px;
                    max-width: 500px;
                    border-radius: 10px;
                    box-shadow: inset 8px #ccc;
                }

                .pointer {
                    margin: 0 2px;
                }

                &.response {
                    .chat-body {
                        background-color: #88d5f8;
                    }

                }

                &.question {
                    .chat-body {
                        background-color: #99ec78;
                    }

                    flex-direction: row-reverse;
                    justify-content: flex-start;

                    .content {
                        text-align: right;
                    }

                    .handle {
                        text-align: right;
                    }


                }
            }
        }

        form {
            margin-top: 10px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80%;
            margin: 10px auto 0;
            background-color: #fff;

            .textarea-container {
                width: calc(100% - 80px);
            }

            textarea {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                background-color: #fff;
                resize: none;
                /* Disable textarea resizing */
                overflow-y: hidden;
                /* Hide vertical scrollbar initially */
                padding: 10px;
                /* Adjust padding as needed */

                /* Add border for styling */

                &:focus+.placeholder,
                &.non-empty+.placeholder {
                    display: none;
                    /* Hide placeholder when focused or when content is present */
                }
            }

            .placeholder {
                position: absolute;
                top: 50%;
                left: 10px;
                transform: translateY(-50%);
                pointer-events: none;
                /* Ensure the placeholder doesn't interfere with textarea interaction */
                color: #999;
                /* Adjust placeholder color as needed */
                transition: top 0.3s, font-size 0.3s;
                /* Add a smooth transition effect */
            }

            .textarea-container {
                position: relative;
                height: 60px;
                /* Set a fixed height for the textarea container */
                overflow: hidden;
                /* Hide overflow content */
            }

            textarea:empty {
                height: 60px;
                /* Set a default height when the textarea is empty */
            }


            #sendBtn {
                cursor: pointer;
            }
        }
    }
}
</style>