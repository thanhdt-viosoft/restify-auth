{
	des: 'Add',
	method: 'POST',
	url: 'http://localhost:9000/Account',
	requestHeader: {
		'content-type': 'multipart/form-data',
		'pj': '5859f93ff672360eac29a41f'
	},
	requestBody: {
		username: 'thanh1',
		password: '123',
		status: 1,
		email: 'doanthuanthanh88@gmail.com',
		birth_day: new Date(1988, 10, 6),
		'file:avatar': 'D:\\logo.png'
	}
}

{
	des: 'Login',
	method: 'HEAD',
	requestHeader: {
		username: 'thanh',
		password: '123',
		'pj': '5859f93ff672360eac29a41f'
	},
	url: 'http://localhost:9000/Login'
}

{
	des: 'Check role',
	method: 'HEAD',
	requestHeader: {
		'token': '5859f93ff672360eac29a41f-585a433fd24b761af0a3151f',
		'path': '/account/abc1',
		'actions': 'ADD',
	},
	url: 'http://localhost:9000/Account'
}

{
	des: 'Get list',
	method: 'GET',
	url: 'http://localhost:9000/Account'
}

{
	des: 'Add role',
	method: 'PUT',
	url: 'http://localhost:9000/Account/5859fb62de0ac62de0713422/Role',
	requestHeader: {
		'content-type': 'application/json',
		'pj': '5859f93ff672360eac29a41f'
	},
	requestBody: {
		roles: [
			'user'
		]
	}
}

{
	des: 'Update account information',
	method: 'PUT',
	url: 'http://localhost:9000/Account/5859fb62de0ac62de0713422/Role',
	requestHeader: {
		'content-type': 'application/json'
	},
	requestBody: {
		roles: [
			'user'
		]
	}
}

{
	des: 'Get detail',
	method: 'GET',
	url: 'http://localhost:9000/Account/ITEM_ID'
}

{
	des: 'Delete',
	method: 'DELETE',
	url: 'http://localhost:9000/Account/ITEM_ID'
}