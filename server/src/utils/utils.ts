export const GenerateError = (routeName:string,err:any) => {
     console.log(`Error coming from ${routeName} and the error is :`,err);
}

export const GenerateResponse = (done:boolean,data:any,error:string) => {
    return {
        success:done,
        data,
        error
    }
}