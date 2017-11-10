const postClasses = ['_58jw', '_5pbx'];

export function getPostClassesSelector() {

    var str = '';

    let i = 0;
    postClasses.forEach(c => {
        if(i != 0)
            str += ', ';

        str += '.' + c;
        i++;
    });

    return str;
}

export const topId = 'pagelet_composer';