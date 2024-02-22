<template>
    <div class="my-component" :style="{ '--height': props.height }">
        <header id="my-header" :class="[props.dir, fullHeight, fullWidth]" ref="headerRef">
            <el-form :model="basicInfo" ref="loginFormRef" label-width="120px" label-position="right"
                :inline="['top', 'bottom'].includes(props.dir)">
                <el-form-item label="视频地址">
                    <el-input v-model="basicInfo.ou" size="small" readonly v-copy="basicInfo.ou" style="width:120px"
                        :title="basicInfo.ou" />
                </el-form-item>

                <el-form-item prop="fn" label="视频名称">
                    <el-input v-model="basicInfo.fn" size="small"
                        :formatter="(value: string) => `${value}`.replace(/[::]+/g, '')" placeholder="请在视频设置里添加信息" readonly
                        style="width:120px" />
                </el-form-item>
                <el-form-item label="封面地址" class="custom-form-item">
                    <el-popover placement="right" trigger="hover">
                        <template #reference>
                            <p style="max-width: 150px; height: 28px; overflow: hidden; text-overflow: ellipsis;">{{
                                basicInfo.cv || '暂无封面....' }}
                            </p>
                        </template>
                        <img v-if="basicInfo.cv" :src="basicInfo.cv" />
                    </el-popover>
                </el-form-item>
                <el-form-item label="视频来源">
                    <p style="max-width: 150px; height: 28px; overflow: hidden; text-overflow: ellipsis;"
                        v-text="(basicInfo.lo + basicInfo.lp + basicInfo.ls) || '暂无'"></p>
                </el-form-item>


                <el-form-item label="截取时间段">
                    <p class="custom-input-line"> {{ basicInfo.tm }}</p>
                </el-form-item>

            </el-form>
            <el-row class="flx-center">
                <el-button type="primary">保存</el-button>
                <el-button type="warning">更新</el-button>
                <el-button type="success" @click="toggleActiveByEvent">关闭</el-button>
                <el-button type="danger" @click="backHistory" > 返回上一级</el-button>

            </el-row>
            <div class="triangle" @click="toggleActive"></div>
        </header>
        <slot></slot>
    </div>
</template>

<script setup lang='ts'>
import { ref, onMounted, reactive, nextTick, computed } from 'vue';
import { TabsPaneContext } from 'element-plus'
import type { FormInstance, FormRules, } from 'element-plus'
import { CaretTop, CaretBottom, Edit, VideoCamera, ChromeFilled, Refresh } from '@element-plus/icons-vue';
import { openEditDrawer, updateUrl, basicInfo, concatData } from "@/hooks/api";
import { useRoute } from 'vue-router';
import { useGlobalStore } from '@renderer/stores/modules/global';

interface PropConf {
    height?: string
    dir?: "top" | "left" | "right" | "bottom",
    isFull?: boolean
    asb: boolean

}

const store = useGlobalStore();
const query = useRoute();
const props = withDefaults(defineProps<PropConf>(), {
    height: "150px",
    dir: "top",
    isFull: false,
    asb: false
})


const headerRef = ref<HTMLElement>()


const toggleActive = (e) => {
    e.target.parentElement.classList.toggle('active');
}

const toggleActiveByEvent = () => {
    headerRef.value.classList.toggle('active');
}

const backHistory = () => {
    history.go(-1);
}

const fullWidth = computed(() => {
    return props.isFull && ['top', 'bottom'].includes(props.dir) ? 'full-width' : ""
})

const fullHeight = computed(() => {
    return props.isFull && !['top', 'bottom'].includes(props.dir) ? 'full-height' : ""
})


defineExpose({
    toggleActiveByEvent
})
</script>

<style scoped lang='scss'>
.my-component {
    // extra
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    --ac-color: #fd5959;
    --bg-color: linear-gradient(to left bottom, #f8cbc3, #f9c4cc, #f1c0da, #e0bfe9, #c3c1f5, #a8c9fe, #8ad0ff, #6dd7fa, #63e2f1, #6eebe1, #8af2cd, #aef6b8);
    --min-width: 320px;

    &.dark {
        --ac-color: #00d5d7;
    }

    #my-header {
        position: absolute;

        background-image: var(--bg-color);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: top, .2856s;
        z-index: 9999;
        box-sizing: border-box;

        .triangle {
            position: absolute;
            width: 0;
            height: 0;
            cursor: pointer;

        }

        &.bottom,
        &.top {
            width: 100%;
            height: calc(var(--height));
        }

        &.left,
        &.right {
            max-width: calc(var(--min-width));
            height: 100%;
            box-sizing: border-box;
            padding: 20px 0;

            .triangle {
                bottom: 20%;
                border-bottom: 10px solid transparent;
                border-top: 10px solid transparent;
            }
        }

        &.full-width {
            position: fixed;
            width: 100vw;
            left: 0;
            padding: 20px 0;
        }

        &.full-height {
            position: fixed;
            height: 100vh;
            padding: 20px 0;
            top: 0;

            &.left {
                left: 0;
            }
        }

        &.top {
            top: calc((-1 * var(--height)) - 20px);

            &.active {
                top: 0;


                .triangle {
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid var(--ac-color);
                    bottom: 0;
                }
            }

            .triangle {
                bottom: -30px;
                right: 20%;
                border-top: 10px solid var(--ac-color);
                border-right: 10px solid transparent;
                border-left: 10px solid transparent;
            }
        }

        &.bottom {
            bottom: calc(-1 * var(--height));

            &.active {
                bottom: 0;

                .triangle {
                    top: 0;
                    right: 20%;
                    border-top: 10px solid var(--ac-color);
                    border-bottom: 10px solid transparent;
                }
            }

            .triangle {
                top: -10px;
                right: 20%;
                border-bottom: 10px solid var(--ac-color);
                border-right: 10px solid transparent;
                border-left: 10px solid transparent;
            }
        }

        &.left {
            left: calc(-1 * var(--min-width));

            &.full-height {
                left: calc(-1 * var(--min-width));
            }

            &.active {
                left: 0;

                .triangle {
                    border-left: 10px solid transparent;
                    border-right: 10px solid var(--ac-color);
                    right: 0;
                }
            }

            .triangle {
                border-right: 10px solid transparent;
                border-left: 10px solid var(--ac-color);
                right: -20px;
            }
        }

        &.right {
            right: calc(-1 * var(--min-width));

            &.active {
                right: 0;

                .triangle {
                    border-right: 10px solid transparent;
                    border-left: 10px solid var(--ac-color);
                    left: 0;
                }
            }

            .triangle {
                border-left: 10px solid transparent;
                border-right: 10px solid var(--ac-color);
                left: -20px;
            }
        }

    }
}
</style>