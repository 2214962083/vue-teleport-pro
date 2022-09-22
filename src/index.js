/* eslint-disable import/namespace */
// 这样方便兼容不同版本的 vue 导出
import * as VuePkg from 'vue'

let uuid = 0
const getUuid = () => `uuid_${uuid++}`

// 查找 vue 实例， vue2 component 实例会挂在 element.__vue__ 属性中，vue3 则挂在 element.__vueParentComponent.ctx 中
const findVueInstance = (element) => {
  if (!element) return null
  return (
    element.__vue__ ||
    (element.__vueParentComponent && element.__vueParentComponent.ctx) ||
    null
  )
}

const vm = {
  name: 'TeleportPro',
  props: {
    to: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // 保证每个 teleport 都有唯一的 uuid
      uuid: getUuid(),
      timeout: 0,
    }
  },
  render(h) {
    const { $slots, $props, uuid } = this

    // 这是 my-teleport 默认插槽的 vnode，有可能为 function，所以先提取出来
    const slotsDefaultVnode =
      typeof $slots.default === 'function' ? $slots.default() : $slots.default

    // 挂载一个 vue 实例到目标 element 上，出于性能考虑，会覆盖原有 element 内容
    const mountSlot = (element) => {
      const vueOptions = {
        name: 'TeleportProChild',
        data() {
          return {
            // 用于渲染的 vnode
            slotDefault: null,
            // 用于销毁本实例的 function
            destroyFn: null,
          }
        },
        methods: {
          // 设置要渲染的 vnode
          setSlotDefault(vnode) {
            this.slotDefault = vnode
          },
          // 允许外部定义销毁本实例的 function
          setDestroyFn(fn) {
            this.destroyFn = fn
          },
          // 销毁本实例
          runDestroyFn() {
            this.destroyFn && this.destroyFn()
          },
        },
        render(h) {
          // 在 vue2 时 h 是 render 函数参数， vue3 时 h 是 import {h} from 'vue'
          h = typeof h === 'function' ? h : VuePkg.h
          const { slotDefault } = this
          // 使用 uuid element 包起来，方便更新时寻找实例
          // 因为很多项目并没有添加 jsx loader，所以写成这种形式，方便各个项目 copy 使用
          return h('div', { id: uuid, attrs: { id: uuid } }, [
            slotDefault || null,
          ])
        },
      }

      let slotVm

      const { version } = VuePkg.default || VuePkg

      // 根据不同版本 vue 创建实例
      if (version.startsWith('2.')) {
        // vue 2.x 创建实例
        const { default: Vue } = VuePkg
        const div = document.createElement('div')
        // 此处不直接 mounted 到目标 element，是因为测试时发现 vue 2.x 会删除目标 element
        // 所以先计算出节点，再 append 到目标 element 上
        slotVm = new Vue(vueOptions).$mount(div)

        // 定义销毁本实例的 function
        slotVm.setDestroyFn(() => {
          slotVm.$destroy()
          slotVm.$el.remove()
        })
        element.appendChild(slotVm.$el)
      } else if (version.startsWith('3.')) {
        // vue 3.x 创建实例
        const { createApp } = VuePkg
        const app = createApp(vueOptions)
        slotVm = app.mount(element)

        // 定义销毁本实例的 function
        slotVm.setDestroyFn(() => {
          app.unmount()
          slotVm.$el.remove()
        })
      } else {
        // vue 其它版本报错
        throw new Error('my-teleport: vue version is not supported')
      }

      // 把 my-teleport 组件默认插槽的 vnode 渲染到 slotVm 中
      slotVm.setSlotDefault(slotsDefaultVnode)

      return slotVm
    }

    // 用 setTimeout 能保证 目标 element 已经渲染完成，也就是下面的 targetElement 有值，这里可以自己优化
    this.timeout = setTimeout(() => {
      // 目标元素
      const targetElement = document.querySelector($props.to)

      // slotVm 实例内的 uuid element
      const uuidElement =
        targetElement && targetElement.querySelector(`#${uuid}`)

      // 看一下有没有 uuid element，若有的话，证明说更新阶段，复用该 element 上的 vue 实例
      let slotVm = findVueInstance(uuidElement)

      if (!targetElement) return
      if (!slotVm) {
        // 第一次挂载
        slotVm = mountSlot(targetElement)
      } else {
        // 后续更新
        slotVm.setSlotDefault(slotsDefaultVnode)
      }
    }, 0)

    // my-teleport 组件只执行逻辑，不提供 ui，所以返回 null
    return null
  },
  methods: {
    // 销毁 slotVm 实例
    destroySlotVm() {
      clearTimeout(this.timeout)
      // 目标元素
      const targetElement = document.querySelector(this.to)

      // slotVm 实例内的 uuid element
      const uuidElement =
        targetElement && targetElement.querySelector(`#${this.uuid}`)

      const slotVm = findVueInstance(uuidElement)

      slotVm && slotVm.runDestroyFn()
    },
  },
  // vue 2.x 销毁周期钩子
  beforeDestroy() {
    this.destroySlotVm()
  },
  // vue 3.x 销毁周期钩子
  beforeUnmount() {
    this.destroySlotVm()
  },
}

export default vm
