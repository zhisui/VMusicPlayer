# 轻量版音乐播放器（更多功能开发中）
### 技术栈
vue3 + pinia + vue-Router + typeScript + sass
### 目前可支持功能
1.支持手机号码、邮箱登录
2.用户收藏的歌单。专辑、歌手、mv展示
3、用户喜欢的音乐、听歌排行展示
4、搜索功能
5、各类型歌单、专辑、歌曲排行榜及详情页面
6、更多功能详看项目页面

### 网易云音乐API服务器运行

git clone git@github.com:Binaryify/NeteaseCloudMusicApi.git   
npm install  
node app.js  
**注意**:服务器启动默认端口为 3000,需改为 5000 端口,可使用以下命令: Mac/Linux  
PORT=5000 node app.js，
windows 下使用 git-bash 或者 cmder 等终端执行以下命令:  
set PORT=5000 && node app.js  
如果以上皆不能更改端口，则直接进入项目文件中搜索const port = process.env.PORT || 3000 将3000改为5000  

### 项目运行

#### 克隆到本地
git clone git@github.com:zhisui/VMusicPlayer.git

#### 进入文件夹
cd VMusicPlayer

#### 安装包管理工具pnpm
npm install pnpm -g

#### 安装依赖
pnpm install 

#### 开启本地服务器localhost:3000
pnpm watch
