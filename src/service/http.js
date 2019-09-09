import axios from 'axios'
import service from './contactApi'
import qs from 'qs'; // 引入qs模块，用来序列化post类型的数据，后面会提到
import { Toast } from 'vant'
// service 循环遍历输出不同的请求方法
let instance = axios.create({
    timeout: 1000,
    // withCredentials: true, // 是否允许带cookie这些
    // transformRequest: [function (data, headers) {
    //     console.log(headers);

    //     if (headers.post['Content-Type'] === 'application/x-www-form-urlencoded') {
    //         // 把一个参数对象格式化为一个字符串
    //         return qs.stringify(data)
    //     } else if (headers.post['Content-Type'] === 'multipart/form-data;charset=UTF-8') {
    //         return data
    //     }
    //     else {
    //         headers.post['Content-Type'] = 'application/json'
    //         return JSON.stringify(data)
    //     }
    // }]
})

// 环境的切换
if (process.env.NODE_ENV == 'development') {
    instance.defaults.baseURL = process.env.VUE_APP_BASE_API;
}
else if (process.env.NODE_ENV == 'production') {
    instance.defaults.baseURL = 'https://www.production.com';
}
// instance.defaults.headers.post['Content-Type'] = 'application/json';

const Http = {}; // 包裹请求方法的容器

// 请求格式/参数的统一
for (let key in service) {
    let api = service[key]; // url method
    // async 作用：避免进入回调地狱
    Http[key] = async function (
        params, // 请求参数 get：url，put，post，patch（data），delete：url
        isFormData = false,// 标识是否是form-data请求
        config = {} // 配置参数
    ) {
        let newParams = {}

        //  content-type是否是form-data的判断
        if (params && isFormData) {
            newParams = new FormData()
            for (let i in params) {
                newParams.append(i, params[i])
            }
        } else {
            newParams = params
        }
        // 不同请求的判断
        let response = {}; // 请求的返回值
        if (api.method === 'put' || api.method === 'post' || api.method === 'patch') {
            try {
                response = await instance[api.method](api.url, newParams, config)
            } catch (err) {
                response = err
            }
        } else if (api.method === 'delete' || api.method === 'get') {
            config.params = newParams
            try {
                response = await instance[api.method](api.url, config)
            } catch (err) {
                response = err
            }
        }
        return response; // 返回响应值
    }
}

// 拦截器的添加
// 请求拦截器
instance.interceptors.request.use(config => {
    // 发起请求前做些什么
    Toast.loading({
        mask: false,
        duration: 0,// 一直存在
        forbidClick: true, // 禁止点击
        message: '加载中...'
    })
    // 若是有做鉴权token, 就给头部带上token
    // 若是需要跨站点,存放到 cookie 会好一点,限制也没那么多,有些浏览环境限制了 localstorage 的使用
    // 这里localStorage一般是请求成功后我们自行写入到本地的,因为你放在vuex刷新就没了
    if (localStorage.token) {
        config.headers.Authorization = localStorage.token;
    }
    return config
}, () => {
    // 请求错误
    Toast.clear()
    Toast('请求错误，请求稍后重试')
})
// 响应拦截器
instance.interceptors.response.use(res => {
    // 请求成功
    Toast.clear()
    return res.data
}, (error) => {
    Toast.clear()
    Toast('请求错误，请求稍后重试')
    if (error.response.status) {
        switch (error.response.status) {
            // 401: 未登录
            // 未登录则跳转登录页面，并携带当前页面的路径
            // 在登录成功后返回当前页面，这一步需要在登录页操作。                
            // case 401:
            //     router.replace({
            //         path: '/login',
            //         query: {
            //             redirect: router.currentRoute.fullPath
            //         }
            //     });
            //     break;

            // 403 token过期
            // 登录过期对用户进行提示
            // 清除本地token和清空vuex中token对象
            // 跳转登录页面                
            // case 403:
            //     Toast({
            //         message: '登录过期，请重新登录',
            //         duration: 1000,
            //         forbidClick: true
            //     });
            //     // 清除token
            //     localStorage.removeItem('token');
            //     // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
            //     setTimeout(() => {
            //         router.replace({
            //             path: '/login',
            //             query: {
            //                 redirect: router.currentRoute.fullPath
            //             }
            //         });
            //     }, 1000);
            //     break;

            // 404请求不存在
            case 404:
                Toast({
                    message: '网络请求不存在',
                    duration: 1500,
                    forbidClick: true
                });
                break;
            // 其他错误，直接抛出错误提示
            default:
                Toast({
                    message: '请求的资源不存在',
                    duration: 1500,
                    forbidClick: true
                });
        }
    }

})

export default Http

//封装成 Vue 插件
// export default {
//     install: function (Vue, Option) {
//         Object.defineProperty(Vue.prototype, "$Http", { value: Http });
//     }
// };