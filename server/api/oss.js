import OSS from 'ali-oss';
let ossClient = void 0;
export function getOssClient(op) {
    if (ossClient)
        return ossClient;
    ossClient = new OSS({
        region: 'oss-cn-hangzhou',
        accessKeyId: 'LTAI5tNpSy9xc' + 'TEcAK7M7Uxu',
        accessKeySecret: 'xJw1QUVCmOs' + 'DT5ZHqJgMssUZTtalqo',
        bucket: 'footballc',
        internal: false,
    });
    return ossClient;
}
