{
    des: 'Add',
    method: 'POST',
    url: 'http://localhost:${port}/${tbl}',
    requestHeader: {
        'content-type': '${contentType}'
    },
    requestBody: {
        ${insertFields}
    }
}

{
    des: 'Get list',
    method: 'GET',
    url: 'http://localhost:${port}/${tbl}'
}

{
    des: 'Update',
    method: 'PUT',
    url: 'http://localhost:${port}/${tbl}/ITEM_ID',
    requestHeader: {
        'content-type': '${contentType}'
    },
    requestBody: {
        ${updateFields}
    }
}

{
    des: 'Get detail',
    method: 'GET',
    url: 'http://localhost:${port}/${tbl}/ITEM_ID'
}

{
    des: 'Delete',
    method: 'DELETE',
    url: 'http://localhost:${port}/${tbl}/ITEM_ID'
}