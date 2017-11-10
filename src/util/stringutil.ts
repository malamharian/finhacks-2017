export function startsWith(str1: string, str2: string) {
    return str1.lastIndexOf(str2, 0) === 0;
}

export function cleanString(str: string) {
    var str2 = str.replace(/\\n/g, "\\n")  
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f");
    
    str2 = str2.replace(/[\u0000-\u0019]+/g,"");

    return str2;
}