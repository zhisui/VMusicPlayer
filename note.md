###Navbar 组件
bug1: NavBar 的搜索框图标在输入的时候样式继承了 body 的，无法显示设置的活动样式。
解决方案： 重新定义一个类并绑定在图标上

bug2: 在头像上绑定点击时显示下拉菜单，失去焦点时隐藏下拉菜单，同时下拉菜单选项中设有点击事件，头像的 onblur 事件和下拉菜单的 onblick 事件会发生冲突，导致下拉菜单的 onclick 事件无法响应
解决方案： 将下拉菜单的 onclick 事件换成 mousedown 事件

bug3: 导航栏下拉菜单下的图标在鼠标悬浮列表时 color 不会变
解决方案：暂时不想管

###AccountLogin 组件
创建 axios 实例
原因： 在实际项目中，可能需要访问多个服务地址，而这些服务请求和响应的结构可能都不相同，
比如 axios1 是用 http 状态码确定响应是否相同，而 axios2 是服务器自己定义的状态码，又或者请求
头不同，支持的 content-type 不同，那么就可以自定义 axios
//常用的基本配置

bug4：在用 v-mode 双向绑定表单时，报错，经排查后邮箱绑定正常，手机和密码部分报错，但是写法时一样的，看了良久，并未觉得有什么错误
解决方案：复制邮箱的部分改写成对应的，最后正常运行，人间迷惑行为，以后还是边写边调试比较好，错误好难找

bug5：登录成功后切换到了音乐库页面，但是检查二维码 key 值得网络请求一直在发送，影响电脑正常运行，检查已在 beforeDestroy 中清除掉定时器，但是不起作用。
解决方案： 将二维码显示对应区域的 v-show 改成 v-if，使用 v-show 只是将组件实例隐藏，但实例却是存在的，v-if 是彻底将其从页面中销毁，可以去原作者那提下 pr

bug6: 在调用 fetchUserProfile 后可获取登录用户信息，再在 fetchLikedPlaylist 中传入用户信息中的 useId 后调用，发现无法读取 state.data.user.userId，导致无法获取用户歌单信息
解决方案：多重新登录几次会获取得到，目前无完美的解决方案

bug7:用 require('electroc')是会报错:require is undefinded
解决方案： 在 mian->src->index.js 文件中的 webPreferences 选项添加配置
nodeIntegration: true,
contextIsolation: false,
此方案也会报错'contextBridge API can only be used when contextIsolation is enabled'，但是程序能正常运行

###改用 pinia 状态管理库后重构代码出现的问题
bug8: 在非组件文件文件的顶部（全局）引入定义好的某个 store，会报该 store 未进行初始化的错误
解决方案：要在使用到的具体函数里面引入某个 store,才可以成功访问到。

bug9: pinia 在写异步请求的时候请求 1 需要请求 2 返回的某个数据作为请求参数，由于请求是异步的，无法确定保证请求
2 的数据可以及时返回
解决方案：用 async 和 await 的写法保证请求 2 的数据已经全部返回再进行后续操作，另外也可以将需要的数据写在
Promise.resolve(需返回的数据)中返回回去，后续可用 then(fn(返回的数据))调用。如果只是正常的调用接口数据，
建议不要在组件里面大量地写 async 和 await,会增加页面渲染时长

bug10: 在 vuex 时，在调用接口的时候直接将字符串作为参数传进 axiois 请求参数里面，并不会报错，但是 pinia 会
解决方案： 参数｛｝包裹之后变成对象之后再传进去，问题解决 tips: 有时候看报错也是一门学问呀，可以受到启发
