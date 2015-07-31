YUI.add(
	'hris-mockup',
	function(A) {
		var TPL_EMPLOYEE_LIST_ITEM = '<li class="employee-list-item" data-employeeId="{employeeId}" tabindex="-1">' +
			'<div class="employee-list-avatar">' +
				'<img class="avatar" src={avatarSrc} />' +
			'</div>' +
			'<div class="employee-list-content">' +
				'<span class="name">{firstName} {lastName}</span>' +
				'<span class="job-title">{jobTitle}</span>' +
			'</div>' +
		'</li>';

		var TPL_FORM_ITEM = '<div class="employee-form-item">' +
			'<label>' +
				'{formLabel}' +
			'</label>' +
			'<input class="{formLabel}" type="text" name="{formLabel}" value="{formValue}" />' +
		'</div>';

		var TPL_FORM_AVATAR = '<div class="employee-form-avatar">' +
			'<img class="avatar" src="{avatarSrc}" />' +
		'</div>';

		var HRISMockup = A.Component.create({

			NAME: 'hrismockup',

			ATTRS: {
				employeeInfo: {
					setter: Object
				},

				employeeList: {
					setter: A.one
				},

				sidebar: {
					setter: A.one
				},

				selectedEmployee: {
					value: null
				},

				sidebarActive: {
					value: false
				},

				lastFocus: {
					value: null
				},

				personalFields: {
					validator: A.Lang.isArray,
					value: ['picture', 'name', 'gender', 'dob', 'salt', 'cell', 'phone', 'email', 'location']
				},

				jobFields: {
					validatior: A.Lang.isArray,
					value: ['job']
				},

				jobTitles: {
					validator: A.Lang.isArray,
					value: ['Senior Developer', 'Software Engineer', 'HR Manager', 'UI Designer', 'Consultant', 'QA Developer', 'Sales Rep', 'Junior Developer', 'IT Manager', 'Support']
				},

				employeeType: {
					validator: A.Lang.isArray,
					value: ['Full Time', 'Part Time', 'Intern', '1099']
				},

				office: {
					validator: A.Lang.isArray,
					value: ['Diamond Bar', 'Dalian, China', 'Tokyo, Japan', 'Chicago, Illinois']
				},
			},

			prototype: {
				renderUI: function() {
					var instance = this;

					instance._generateEmployees();
				},

				bindUI: function() {
					var instance = this;

					instance._bindEmployeeList();

					instance._bindSidebar();
				},

				handleEmployeeSelect: function(event) {
					var instance = this;

					var currentTarget = event.currentTarget

					if (event.type == 'key') {
						currentTarget = event.target;
					}

					instance._unselectEmployee();

					currentTarget.addClass('active');

					currentTarget.addClass('selected');

					var currentEmployeeId = currentTarget.getData('employeeId')

					instance.set('selectedEmployee', currentEmployeeId);

					instance._toggleSidebar(currentEmployeeId);
				},

				handleToggleSidebar: function(event) {
					var instance = this;

					instance._toggleSidebar();

					instance._unselectEmployee();
				},

				handleEmployeeFocus: function(event) {
					if (event.target.get('nodeName') != "INPUT") {
						var instance = this;

						var employeeList = instance.get('employeeList');

						var currentFocus = employeeList.one('.employee-list-item.selected') || employeeList.one('.employee-list-item.active') || employeeList.one('.employee-list-item');

						event.preventDefault();

						event.stopPropagation();

						switch(event.button) {
							case 40:
								var nextItem = currentFocus.next() || A.one('.employee-list-item');
								nextItem.addClass('selected');
								nextItem.focus();
								currentFocus.removeClass('selected');
							break;

							case 38:
								var previousItem = currentFocus.previous() || A.one('.employee-list-item:last-child');
								previousItem.addClass('selected');
								previousItem.focus();
								currentFocus.removeClass('selected');
							break;
						}
					}
				},

				handleFocusEmployeeList: function(event) {
					var instance = this;

					var employeeList = instance.get('employeeList');

					var currentFocus = employeeList.one('.employee-list-item.selected') || employeeList.one('.employee-list-item.active');

					event.preventDefault();

					event.stopPropagation();

					currentFocus.focus();
				},

				handleTabSidebar: function(event) {
					var instance = this;

					event.stopPropagation();

					if(instance.get('sidebarActive')) {

						var sidebar = instance.get('sidebar');

						var currentInput = sidebar.one('input:focus');

						var nextInput;

						if (currentInput) {
							var allInputs = sidebar.all('input');
							var lastInput = allInputs.last();
							var firstInput = allInputs.first();

							var shiftKey = event.shiftKey;

							if (currentInput === lastInput && !shiftKey) {
								event.preventDefault();

								nextInput = firstInput;
							}
							else if (currentInput === firstInput && shiftKey) {
								event.preventDefault();

								nextInput = lastInput;
							}
						}

						else {
							event.preventDefault();

							nextInput = sidebar.one('input');
						}

						if (nextInput) {
							nextInput.focus();
						}
					}
				},

				handleFormInputFocus: function(event) {
					var instance = this;

					var focusedInput = event.currentTarget;

					instance.set('lastFocus', focusedInput.attr('name'));
				},

				_bindEmployeeList: function() {
					var instance = this;

					var employeeList = instance.get('employeeList');

					employeeList.delegate(
						'click',
						A.bind('handleEmployeeSelect', instance),
						'.employee-list-item'
					);

					A.one('body').on(
						'key',
						A.bind('handleEmployeeFocus', instance),
						'down:38,40'
					);

					employeeList.on(
						'key',
						A.bind('handleEmployeeSelect', instance),
						'down:13',
						'.employee-list-item.selected'
					);

					employeeList.on(
						'key',
						A.bind('handleTabSidebar', instance),
						'down:9'
					);
				},

				_bindSidebar: function() {
					var instance = this;

					var sidebar = instance.get('sidebar');

					sidebar.on(
						'key',
						A.bind('handleFocusEmployeeList', instance),
						'down:27'
					);

					sidebar.on(
						'key',
						A.bind('handleTabSidebar', instance),
						'down:9, 9+16'
					);

					sidebar.delegate(
						'focus',
						A.bind('handleFormInputFocus', instance),
						'input'
					);

					sidebar.one('.close-button').on(
						'click',
						A.bind('handleToggleSidebar', instance)
					);
				},

				_toggleSidebar: function(employeeId) {
					var instance = this;

					var sidebar = instance.get('sidebar');

					if (employeeId) {
						instance.set('sidebarActive', true);

						sidebar.toggleClass('closed', false);

						var employeeInfo = instance.get('employeeInfo');

						var currentEmployeeInfo = employeeInfo[employeeId];

						instance._generateFormField(currentEmployeeInfo, sidebar);

						var focusedInputName = instance.get('lastFocus');

						if (focusedInputName) {
							sidebar.one('input[name="' + focusedInputName + '"]').focus();
						}
					}

					else {
						instance.set('sidebarActive', false);

						sidebar.toggleClass('closed', true);
					}
				},

				_unselectEmployee: function() {
					var instance = this;

					var employeeList = instance.get('employeeList');

					var previousEmployeeId = instance.get('selectedEmployee');

					if (previousEmployeeId) {
						var previousEmployeeItem = employeeList.one('[data-employeeId="' + previousEmployeeId + '"]');

						previousEmployeeItem.removeClass('active');

						employeeList.one('.selected').removeClass('selected');

						instance.set('selectedEmployee', null)
					}
				},

				_generateFormField: function(employeeInfo, sidebar) {
					var instance = this;

					var buffer = [];

					var personalFields = instance.get('personalFields');

					var length = personalFields.length;

					for (var i = 0; i < length; i++) {
						var field = personalFields[i];

						if (field == 'picture') {
							buffer.push(
								A.Lang.sub(
									TPL_FORM_AVATAR,
									{
										avatarSrc: employeeInfo.user[field]['large']
									}
								)
							);

						}

						else if (field == 'name') {
							var lastName = employeeInfo.user[field]['last'];
							var firstName = employeeInfo.user[field]['first'];

							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'last name',
										formValue: instance._capitalize(lastName),
									}
								)
							);

							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'first name',
										formValue: instance._capitalize(firstName),
									}
								)
							);
						}

						else if (field == 'dob') {
							var birthday = Math.floor((Math.random() * 12) + 1) + '/';
							birthday += Math.floor((Math.random() * 30) + 1) + '/';
							var age = Math.floor((Math.random() * 20) + 20);
							birthday += 2015 - age;

							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'birthday',
										formValue: birthday
									}
								)
							);

							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'age',
										formValue: age
									}
								)
							);
						}

						else if (field == 'location') {
							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'street',
										formValue: employeeInfo.user[field]['street']
									}
								)
							);

							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'city',
										formValue: instance._capitalize(employeeInfo.user[field]['city'])
									}
								)
							);

							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'region',
										formValue: instance._capitalize(employeeInfo.user[field]['state'])
									}
								)
							);

							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'zip',
										formValue: employeeInfo.user[field]['zip']
									}
								)
							);
						}

						else if (field == 'salt') {
							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'ssn',
										formValue: employeeInfo.user[field]
									}
								)
							);
						}

						else if (field == 'email') {
							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'e-mail',
										formValue: employeeInfo.user[field]
									}
								)
							);

							buffer.push('<br>');
						}

						else {
							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: field,
										formValue: employeeInfo.user[field]
									}
								)
							);
						}
					}

					buffer = buffer.join('');

					var formField = sidebar.one('.form-field > .personal');

					formField.all('*').remove(true);

					formField.append(buffer);

					buffer = [];

					var jobFields = instance.get('jobFields');

					var length = jobFields.length;

					for (var i = 0; i < length; i++) {
						var field = jobFields[i];

						if (field == 'job') {
							buffer.push(
								A.Lang.sub(
									TPL_FORM_ITEM,
									{
										formLabel: 'job title',
										formValue: employeeInfo.user[field]
									}
								)
							);
						}
					}

					buffer = buffer.join('');

					var formField = sidebar.one('.form-field > .job');

					formField.all('*').remove(true);

					formField.append(buffer);
				},

				_generateEmployees: function() {
					var instance = this;

					A.io.request(
						'../user.json',
						{
							dataType: 'json',

							on: {
								success: A.bind(this._parseEmployees, this),
							}
						}
					);
				},

				_parseEmployees: function(event, id, obj) {
					var instance = this

					var response = obj.responseText;

					var parsedResponse;

					try {
						parsedResponse = A.JSON.parse(response);
					}
					catch (e) {
						alert('json parse failed!')
					}

					var results = parsedResponse.results;

					instance._generateEmployeeInfo(results)

					results.sort(function(a, b) {
						if (a.user.name.first > b.user.name.first) {
							return 1;
						}
						if (a.user.name.first < b.user.name.first) {
							return -1;
						}
						return 0;
					});

					instance.set('employeeInfo', results);

					var resultsLength = results.length;

					for(var i = 0; i < resultsLength; i++) {
						instance._createEmployeeCard(results[i].user, i);
					}
				},

				_generateEmployeeInfo: function(information) {
					var instance = this;

					var length = information.length;

					var jobTitles = instance.get('jobTitles');

					var jobTitleLength = jobTitles.length;

					for(var i = 0; i < length; i++) {
						information[i].user['job'] = jobTitles[Math.floor(Math.random() * jobTitleLength) + 1];
					}
				},

				_createEmployeeCard: function(user, employeeId) {
					var instance = this;

					var employeeList = instance.get('employeeList');

					var employeeCard = A.Lang.sub(
						TPL_EMPLOYEE_LIST_ITEM,
						{
							avatarSrc: user.picture.thumbnail,
							employeeId: employeeId,
							firstName: instance._capitalize(user.name.first),
							jobTitle: user.username,
							lastName: instance._capitalize(user.name.last)
						}
					);
					employeeList.append(employeeCard);
				},

				_capitalize: function(string) {
					return string.charAt(0).toUpperCase() + string.slice(1);
				}
			}
		});

		A.HRISMockup = HRISMockup;
	},
	'',
	{
		requires: ['anim', 'aui-base', 'aui-component', 'aui-node', 'aui-io-request', 'event', 'resize', 'transition', 'widget']
	}
);