export function corsOptions(origin: any, cb: Function): void {
  if (/localhost/.test(origin)) {
    //  Request from localhost will pass
    cb(null, true);
    return;
  }
  cb(new Error("Not allowed"), false);
}
