{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:9000/Project',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		name: 'Project 02',
		status: 1
	}
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:9000/Project'
}

{
	des: 'Update',
	method: 'PUT',
	url: 'http://localhost:9000/Project/5859f93ff672360eac29a41f',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		name: 'Project 02',
		status: 1,
		roles: {
			user: [
				{ path: '^/account/.*$', actions: ['ADD', 'EDIT'] }
			]
		}
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:9000/Project/5859f93ff672360eac29a41f'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:9000/Project/ITEM_ID'
}