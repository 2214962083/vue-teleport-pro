# Vue Teleport Pro

1) 类似 vue3 的 teleport 组件，不过不受生命周期限制，可以套在 v-if 内。
2) 兼容 vue2 和 vue3
3) 代码少，小巧灵活，性能不减

## Installation

执行以下命令安装:

```bash
npm i vue-teleport-pro
```

## Usage

### props

```js
{
  to: string // 目标 element selector
}
```

### example

```vue
<template>
  <div>
    <template v-if="showTeleport">
      <teleport-pro to="#target">
        <button>我是teleport内容，统计: {{ count }}</button>
      </teleport-pro>
    </template>
    <div style="border: 1px solid #000; width: 100px; height: 100px">
      我是目标盒子 {{ count }}
      <div id="target"></div>
    </div>
    <button @click="showTeleport = !showTeleport">
      显示或隐藏teleport内容
    </button>
    <button @click="count += 1">点击更新teleport内容</button>
  </div>
</template>

<script>
import TeleportPro from "vue-teleport-pro";

export default {
  components: {
    TeleportPro,
  },
  data() {
    return {
      count: 0,
      showTeleport: true,
    };
  },
};
</script>
```

例子效果请看: [https://codesandbox.io/s/vue-teleport-pro-example-o19vq?file=/src/App.vue](https://codesandbox.io/s/vue-teleport-pro-example-o19vq?file=/src/App.vue)

### Downloading directly from CDN

```html
<!-- jsdelivr cdn (推荐) -->
<script src="https://cdn.jsdelivr.net/npm/vue-teleport-pro@latest"></script>

<!-- 或者 unpkg cdn -->
<!-- <script src="https://unpkg.com/vue-teleport-pro@latest"></script> -->

<script>
  const TeleportPro = window.TeleportPro
  // write your code here
</script>
```