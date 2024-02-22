export enum PageEnum {
    BASE_ROOT = "/",
    // 登录
    BASE_LOGIN = '/login',
    BASE_LOGIN_NAME = 'Login',
    //重定向
    REDIRECT = '/redirect',
    REDIRECT_NAME = 'Redirect',
    // 首页
    BASE_HOME = '/home',
    BASE_HOME_NAME = 'home',
    //首页跳转默认路由
    BASE_HOME_REDIRECT = '/home',
    // 错误
    BASE_ERROR = "/500",
    ERROR_PAGE_NAME = 'ErrorPage',
    // 未发现
    BASE_NOTFOUND = "/404",
    NOTFOUND_PAGE_NAME = "NotFound",
    // 禁止访问
    BASE_FORBIDDEN = "/403",
    FORBIDDEN_PAGE_NAME = "forbidden"
}