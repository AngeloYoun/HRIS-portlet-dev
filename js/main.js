YUI.add(
	'hris-mockup',
	function(A) {
		var TPL_EMPLOYEE_LIST_ITEM = '<li class="employee-list-item {cssClass}" data-employeeId="{employeeId}" tabindex="-1">' +
			'<div class="employee-list-avatar">' +
				'<img class="avatar" src="{avatarSrc}" />' +
			'</div>' +
			'<div class="employee-list-content">' +
				'<span class="name">{firstName} {lastName}</span>' +
				'<span class="job-title">{jobTitle}</span>' +
			'</div>' +
		'</li>';

		var TPL_FORM_ITEM = '<div class="employee-form-item form-item">' +
			'<label class="form-label">' +
				'{formLabel}' +
			'</label>' +
			'<input class="employee-input" type="text" name="{formLabel}" value="{formValue}" />' +
		'</div>';

		var TPL_FORM_SELECT_START = '<div class="dropdown employee-form-item form-item">' +
			'<label class="form-label">' +
				'{formLabel}' +
			'</label>' +
			'<input type="text" class="employee-input" name="{formLabel}" data-toggle="dropdown" tabIndex="0" readonly value="{formValue}"/>' +
			'<ul class="dropdown-container">';

		var TPL_FORM_OPTION = '<li class="dropdown-option-container"><a class="dropdown-option" href="#" data-value="{selectOption}">{selectOption}</a></li>';

		var TPL_FORM_OPTION_NEW = '<li class="dropdown-option-container"><div class="new-option-container"><label class="form-label">create new</label><input class="new-option" value="" type="text" /></div></li>' +
		'<li class="dropdown-option-container"><a class="dropdown-option" href="#" >manage options</a></li>'

		var TPL_FORM_SELECT_END = '</ul>' +
		'</div>';

		var TPL_FORM_AVATAR = '<div class="employee-form-avatar">' +
			'<img class="avatar" src="{avatarSrc}" />' +
		'</div>';

		var HRISMockup = A.Component.create({

			NAME: 'hrismockup',

			ATTRS: {
				contentBox: {
					setter: A.one
				},

				employeeInfo: {
					setter: Object
				},

				employeeList: {
					setter: A.one
				},

				employeeCount: {
					value: 0
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

				dropdownFields: {
					validator: A.Lang.isArray,
					value: {
						'gender': ['male', 'female'],
					}
				},

				formFields: {
					value: {
						personalFields: ['picture', 'name', 'gender', 'dob', 'salt', 'cell', 'phone', 'email', 'location'],

						jobFields: ['jobTitle', 'employment', 'office', 'department'],

						payFields: ['exemptStatus', 'maritalStatus', 'batchType', 'wage'],

						benefitFields: ['medicalPlan', 'medicalPlanOption', 'dentalPlan', 'dentalPlanOption', 'visionPlan', 'visionPlanOption']
					}
				},

				generatedInfo: {
					value: {
						gender: ['male', 'female'],

						jobTitle: ['Senior Developer', 'Software Engineer', 'HR Manager', 'UI Designer', 'Consultant', 'QA Developer', 'Sales Rep', 'Junior Developer', 'IT Manager', 'Support'],

						employment: ['Full Time', 'Part Time', 'Intern', '1099'],

						office: ['Diamond Bar', 'Dalian, China', 'Tokyo, Japan', 'Chicago, Illinois'],

						department: ['Frontend', 'Human Resources', 'Quality Assurance', 'Sales', 'Internal Services'],

						exemptStatus: ['Exempt', 'Non-Exempt'],

						maritalStatus: ['Married', 'Single', 'Married at Single Rate'],

						batchType: ['Hourly', 'Salary'],

						medicalPlan: ['Anthem Lumenos', 'Anthem HMO', 'Anthem HSA'],

						medicalPlanOption: ['EE', 'EE + Spouse', 'EE + Children', 'EE + Family', 'Waived'],

						dentalPlan: ['Guardian Base', 'Guardian Buy-up'],

						dentalPlanOption: ['EE', 'EE + Spouse', 'EE + Children', 'EE + Family', 'Waived'],

						visionPlan: ['VSP Vision'],

						visionPlanOption: ['EE', 'EE + Spouse', 'EE + Children', 'EE + Family', 'Waived'],

						benefitOptions: ['FSA Medical', 'FSA Dependent Care', 'General Life Plan', 'Voluntary Life Insurance Employee', 'Voluntary Life Insurance Spouse', 'Voluntary Life Insurance Children', 'Short Term Disability', 'Long Term Disability'],

						fsaPeriod: ['Per Pay Period', 'Yearly'],
					}
				},
			},

			prototype: {
				renderUI: function() {
					var instance = this;

					instance._generateEmployees();
				},

				bindUI: function() {
					var instance = this;

					instance._bindContentBox();

					instance._bindEmployeeList();

					instance._bindSidebar();
				},

				handleEmployeeSelect: function(event) {
					var instance = this;

					var currentTarget = event.currentTarget;

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

				handleDropdownCycle: function(event) {
					var instance = this;

					var dropdown = event.currentTarget;

					var currentFocus = dropdown.one('.dropdown-option:focus') || dropdown.one('.new-option:focus');

					event.preventDefault();

					event.stopPropagation();

					switch(event.button) {
						case 40:
							if (currentFocus) {
								currentFocus = currentFocus.ancestor('.dropdown-option-container').next('.dropdown-option-container') || dropdown.one('.dropdown-option-container');
								currentFocus = currentFocus.one('.dropdown-option') || currentFocus.one('.new-option');
							}
							else {
								currentFocus = dropdown.one('.dropdown-option');
							}

							currentFocus.focus();
						break;

						case 38:
							if (currentFocus) {
								currentFocus = currentFocus.ancestor('.dropdown-option-container').previous('.dropdown-option-container') || dropdown.one('.dropdown-option-container:last-child');
								currentFocus = currentFocus.one('.dropdown-option') || currentFocus.one('.new-option');
							}
							else {
								currentFocus = dropdown.one('.dropdown-option-container:last-child .new-option') ||('.dropdown-option-container:last-child > .dropdown-option');
							}

							currentFocus.focus();
						break;
					}

					dropdown.addClass('open');
				},

				handleEmployeeFocus: function(event) {
					if (event.target.hasClass('employee-list-item')) {
						var instance = this;

						var employeeList = instance.get('employeeList');

						var currentFocus = employeeList.one('.employee-list-item.selected') || employeeList.one('.employee-list-item.active') || employeeList.one('.employee-list-item');

						event.preventDefault();

						event.stopPropagation();

						switch(event.button) {
							case 40:
								var nextItem = currentFocus.next('.employee-list-item') || A.one('.employee-list-item');
								nextItem.addClass('selected');
								nextItem.focus();
								currentFocus.removeClass('selected');
							break;

							case 38:
								var previousItem = currentFocus.previous('.employee-list-item') || A.one('.employee-list-item:last-child');
								previousItem.addClass('selected');
								previousItem.focus();
								currentFocus.removeClass('selected');
							break;
						}
					}
				},

				handleCancelFocus: function(event) {
					var instance = this;

					var employeeList = instance.get('employeeList');

					var currentFocus = employeeList.one('.employee-list-item.selected') || employeeList.one('.employee-list-item.active') || employeeList.one('.employee-list-item');

					event.preventDefault();

					event.stopPropagation();

					currentFocus.focus();
				},

				handleCreateEmployee: function(event) {
					var instance = this;

					employeeList = instance.get('employeeList');

					var newEmployeeContainer = employeeList.one('.employee-list-item');

					var newEmployeeId = instance.get('employeeCount') + 1;

					var newEmployeeCard = A.Lang.sub(
						TPL_EMPLOYEE_LIST_ITEM,
						{
							avatarSrc: '""',
							cssClass: 'placeholder',
							employeeId: newEmployeeId,
							firstName: 'New',
							jobTitle: '',
							lastName: 'Employee'
						}
					);

					employeeList.insert(newEmployeeCard, newEmployeeContainer);

					instance.set('employeeCount', newEmployeeId);
				},

				handleDropdownSelection: function(event) {
					var instance = this;

					var dropdownOption = event.currentTarget;

					event.stopPropagation();

					event.preventDefault();

					var dropdownInput = dropdownOption.one('input');

					if (dropdownInput) {
						dropdownInput.focus();
					}

					else {
						var optionValue = dropdownOption.getData('value');

						var containerNode = dropdownOption.ancestor('.dropdown');

						var inputField = containerNode.one('input');

						inputField.attr('value', optionValue);

						inputField.focus();

						containerNode.removeClass('open');
					}
				},

				handleImageLoad: function(event) {
					var currentTarget = event.currentTarget;

					currentTarget.ancestor().addClass('loaded');
				},

				handleFormNavSelect: function(event, node) {
					var instance = this;

					var currentTarget = node || event.currentTarget;

					var navContainer = currentTarget.ancestor();

					var lastActive = navContainer.one('.active');

					if (lastActive !== currentTarget) {

						lastActive.removeClass('active');

						currentTarget.addClass('active');
					}
				},

				handleFormScroll: function(event) {
					var instance = this;

					containerNode = event.target;

					var formSections = containerNode.all('.form-category-header');

					var length = formSections.size();

					for (var i = 0; i < length; i++) {
						var headerNode = formSections.item(i);

						if (containerNode.inRegion(headerNode, false)) {
							var id = headerNode.attr('id');

							instance.handleFormNavSelect(null, A.one('#' + id + '-link'));

							break;
						}
					}
				},

				handleTabSidebar: function(event) {
					var instance = this;

					if (event) {
						event.stopPropagation();
					}

					if (instance.get('sidebarActive')) {
						var sidebar = instance.get('sidebar');

						var currentInput = sidebar.one('.focus > .employee-input');

						var nextInput;
						var shiftKey;

						if (event) {
							event.preventDefault();
							shiftKey = event.shiftKey;
						}
						else {
							shiftKey = false;
						}

						if (currentInput) {
							var allInputs = sidebar.all('.employee-input');
							var lastInput = allInputs.last();
							var firstInput = allInputs.first();

							if (currentInput === lastInput && !shiftKey) {
								nextInput = firstInput;
							}
							else if (!shiftKey) {
								var index = allInputs.indexOf(currentInput);

								nextInput = allInputs.item(index + 1);
							}
							else if (currentInput === firstInput && shiftKey) {
								nextInput = lastInput;
							}
							else if (shiftKey) {
								var index = allInputs.indexOf(currentInput);

								nextInput = allInputs.item(index - 1);
							}
						}

						else {
							nextInput = sidebar.one('.employee-input');
						}

						if (nextInput) {
							nextInput.focus();
						}

						return true;
					}

					else {
						return false;
					}
				},

				handleToggleNavBar: function(event) {
					var instance = this;

					var btnNode = event.currentTarget;

					btnNode.toggleClass('active');

					var contentBox = instance.get('contentBox');

					contentBox.toggleClass('navbar-visible');
				},

				handleFormInputFocus: function(event) {
					var instance = this;

					var focusedInput = event.currentTarget;

					focusedInput.addClass('focus');

					if (focusedInput.hasClass('.employee-form-item')) {
						instance._setLastFocus(focusedInput);
					}

					if (focusedInput.hasClass('dropdown') && event.type == 'click') {
						focusedInput.addClass('open');
					}
				},

				handleDropdownOpen: function(event) {
					var dropdownNode = event.currentTarget;

					dropdownNode.addClass('open');
				},

				_setLastFocus: function(focusedInput) {
					var instance = this;

					instance.set('lastFocus', focusedInput.one('.employee-input').attr('name'));
				},

				handleFormInputBlur: function(event) {
					var instance = this;

					var inputContainer = event.currentTarget;

					var relatedTarget = event.relatedTarget;

					if (!(relatedTarget && (relatedTarget.hasClass('dropdown-option') || relatedTarget.hasClass('new-option')))) {
						inputContainer.removeClass('focus');
						inputContainer.removeClass('open');
					}
				},

				_bindContentBox: function() {
					var instance = this;

					var contentBox = instance.get('contentBox');

					contentBox.delegate(
						'key',
						A.bind('handleCancelFocus', instance),
						'down:27'
					);

					contentBox.on(
						'key',
						A.bind('handleEmployeeFocus', instance),
						'down:38,40'
					);

					contentBox.delegate(
						'click',
						A.bind('handleToggleNavBar', instance),
						'.navbar-toggle-btn'
					);

					contentBox.delegate(
						'focus',
						A.bind('handleFormInputFocus', instance),
						'.form-item'
					);

					contentBox.delegate(
						'blur',
						A.bind('handleFormInputBlur', instance),
						'.form-item'
					);

					contentBox.delegate(
						'click',
						A.bind('handleFormInputFocus', instance),
						'.dropdown'
					);

					contentBox.delegate(
						'key',
						A.bind('handleDropdownCycle', instance),
						'down:38,40',
						'.dropdown'
					);

					contentBox.delegate(
						'key',
						A.bind('handleDropdownSelection', instance),
						'down:13',
						'.dropdown-option'
					);

					contentBox.delegate(
						'click',
						A.bind('handleDropdownSelection', instance),
						'.dropdown-option'
					);

					contentBox.on(
						'key',
						A.bind('handleTabSidebar', instance),
						'down:9'
					);
				},

				_bindEmployeeList: function() {
					var instance = this;

					var employeeList = instance.get('employeeList');

					employeeList.delegate(
						'click',
						A.bind('handleEmployeeSelect', instance),
						'.employee-list-item'
					);

					employeeList.on(
						'key',
						A.bind('handleEmployeeSelect', instance),
						'down:13',
						'.employee-list-item.selected'
					);

					employeeList.one('.create-employee-btn').on(
						'click',
						A.bind('handleCreateEmployee', instance)
					);
				},

				_bindSidebar: function() {
					var instance = this;

					var sidebar = instance.get('sidebar');

					sidebar.delegate(
						'click',
						A.bind('handleFormNavSelect', instance),
						'.form-nav-item'
					);

					sidebar.delegate(
						'key',
						A.bind('handleTabSidebar', instance),
						'down:13',
						'.employee-input'
					);

					sidebar.one('.form-field').on(
						'scroll',
						A.bind('handleFormScroll', instance)
					);

					// sidebar.delegate(
					// 	'click',
					// 	A.bind('handleDropdownSelection', instance),
					// 	'.dropdown-option'
					// );

					// sidebar.delegate(
					// 	'focus',
					// 	A.bind('handleFormInputFocus', instance),
					// 	'.employee-form-item'
					// );

					// sidebar.delegate(
					// 	'blur',
					// 	A.bind('handleFormInputBlur', instance),
					// 	'.employee-form-item'
					// );

					// sidebar.delegate(
					// 	'key',
					// 	A.bind('handleDropdownCycle', instance),
					// 	'down:38,40',
					// 	'.dropdown'
					// );

					sidebar.one('.close-button').on(
						'click',
						A.bind('handleToggleSidebar', instance)
					);
				},

				_bindSidebarInstance: function(sidebar) {
					var instance = this;

					sidebar.one('.avatar').on(
						'load',
						A.bind('handleImageLoad', instance)
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

						if (currentEmployeeInfo) {
							instance._generateEmployeeForm(currentEmployeeInfo, sidebar);
						}

						else {
							currentEmployeeInfo = instance._generateBlankUserInfo();

							var count = instance.get('employeeCount');

							instance._generateEmployeeForm(currentEmployeeInfo, sidebar);
						}

						var focusedInputName = instance.get('lastFocus');

						if (focusedInputName) {
							sidebar.one('.employee-input[name="' + focusedInputName + '"]').focus();
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

						instance.set('selectedEmployee', null);
					}
				},

				_generateBlankUserInfo: function() {
					var instance = this;

					var employeeInfo = instance.get('employeeInfo');

					var template = employeeInfo[0].user;

					var length = template.length;

					var newInfo = {
						user: {}
					};

					for (var key in template) {
						if (typeof template[key] === 'object') {
							var subInfo = {};

							for (var subKey in template[key]) {
								subInfo[subKey] = "";
							}

							newInfo['user'][key] = subInfo;
						}

						else {
							newInfo['user'][key] = "";
						}
					}

					return newInfo;
				},

				_generatePersonalFields: function(employeeInfo) {
					var instance = this;

					var buffer = [];

					var personalFields = instance.get('formFields')['personalFields'];

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

							buffer.push(instance._generateFormField('last name', instance._capitalize(lastName)));

							buffer.push(instance._generateFormField('first name', instance._capitalize(firstName)));

							buffer.push('<br>');
						}

						else if (field == 'dob') {
							var birthday = Math.floor((Math.random() * 12) + 1) + '/';
							birthday += Math.floor((Math.random() * 30) + 1) + '/';
							var age = Math.floor((Math.random() * 20) + 20);
							birthday += 2015 - age;

							buffer.push(instance._generateFormField('birthday', birthday));

							buffer.push(instance._generateFormField('age', age));

							buffer.push('<br>');
						}

						else if (field == 'location') {
							buffer.push(instance._generateFormField('street', employeeInfo.user[field]['street']));

							buffer.push(instance._generateFormField('city', instance._capitalize(employeeInfo.user[field]['city'])));

							buffer.push(instance._generateFormField('region', instance._capitalize(employeeInfo.user[field]['state'])));

							buffer.push(instance._generateFormField('zip', employeeInfo.user[field]['zip']));
						}

						else if (field == 'salt') {
							buffer.push(instance._generateFormField('ssn', employeeInfo.user[field]));
						}

						else if (field == 'email') {
							buffer.push(instance._generateFormField('e-mail', employeeInfo.user[field]));

							buffer.push('<br>');
						}

						else if (field == 'gender') {
							buffer.push(instance._generateFormSelect(field, employeeInfo.user[field]));

							buffer.push('<br>');
						}

						else {
							buffer.push(instance._generateFormField(field, employeeInfo.user[field]));
						}
					}

					buffer = buffer.join('');

					return buffer;
				},

				_generateJobFields: function(employeeInfo) {
					var instance = this;

					var buffer = [];

					var jobFields = instance.get('formFields')['jobFields'];

					var length = jobFields.length;

					for (var i = 0; i < length; i++) {
						var field = jobFields[i];

						if (instance.get('generatedInfo')[field]) {
							buffer.push(instance._generateFormSelect(field, employeeInfo.user[field]));
						}
						else {
							buffer.push(instance._generateFormField(field, employeeInfo.user[field]));
						}
					}

					buffer = buffer.join('');

					return buffer;
				},

				_generatePayFields: function(employeeInfo) {
					var instance = this;

					var buffer = [];

					var payFields = instance.get('formFields')['payFields'];

					var length = payFields.length;

					for (var i = 0; i < length; i++) {
						var field = payFields[i];

						if (instance.get('generatedInfo')[field]) {
							buffer.push(instance._generateFormSelect(field, employeeInfo.user[field]));
						}
						else {
							buffer.push(instance._generateFormField(field, employeeInfo.user[field]));
						}
					}

					buffer = buffer.join('');

					return buffer;
				},

				_generateBenefitFields: function(employeeInfo) {
					var instance = this;

					var buffer = [];

					var benefitFields = instance.get('formFields')['benefitFields'];

					var length = benefitFields.length;

					for(var i = 0; i < length; i++) {
						var field = benefitFields[i];

						if (instance.get('generatedInfo')[field]) {
							buffer.push(instance._generateFormSelect(field, employeeInfo.user[field]));

							if (["medicalPlanOption", "dentalPlanOption", "visionPlanOption"].indexOf(field) != -1) {
								buffer.push('<br>');
							}
						}
						else {
							buffer.push(instance._generateFormField(field, employeeInfo.user[field]));
						}
					}

					buffer = buffer.join('');

					return buffer;
				},

				_convertCamelCase: function(str) {
					var result = str.replace( /([A-Z])/g, function(v) {
						return " " + v.toLowerCase();
					});
					return result;
				},

				_generateFormField: function(formLabel, formValue) {
					return formString = A.Lang.sub(
						TPL_FORM_ITEM,
						{
							formLabel: formLabel,
							formValue: formValue
						}
					)
				},

				_generateFormSelect: function(formLabel, formValue) {
					var instance = this;

					var buffer = [];

					buffer.push(A.Lang.sub(
						TPL_FORM_SELECT_START,
						{
							formLabel: instance._convertCamelCase(formLabel),
							formValue: formValue
						}

					));

					var formInfo = instance.get('generatedInfo')[formLabel];

					var length = formInfo.length;

					for(var i = 0; i < length; i++) {
						buffer.push(A.Lang.sub(
							TPL_FORM_OPTION,
							{
								selectOption: formInfo[i]
							}
						));
					}

					buffer.push(TPL_FORM_OPTION_NEW);

					buffer.push(TPL_FORM_SELECT_END);

					buffer = buffer.join('');

					return buffer;
				},

				_resetFormFields: function(sidebar, selector, buffer) {
					var formField = sidebar.one('.form-field > ' + selector);

					formField.all('*').remove(true);

					formField.append(buffer);
				},

				_generateEmployeeForm: function(employeeInfo, sidebar) {
					var instance = this;

					var buffer = instance._generatePersonalFields(employeeInfo);

					instance._resetFormFields(sidebar, '.personal', buffer);

					buffer = instance._generateJobFields(employeeInfo);

					instance._resetFormFields(sidebar, '.job', buffer);

					buffer = instance._generatePayFields(employeeInfo);

					instance._resetFormFields(sidebar, '.pay', buffer);

					buffer = instance._generateBenefitFields(employeeInfo);

					instance._resetFormFields(sidebar, '.benefits-deductions', buffer);

					instance._bindSidebarInstance(sidebar);
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

					instance._generateEmployeeInfo(results, 'jobTitle');

					instance._generateEmployeeInfo(results, 'employment');

					instance._generateEmployeeInfo(results, 'office');

					instance._generateEmployeeInfo(results, 'department');

					instance._generateEmployeeInfo(results, 'exemptStatus');

					instance._generateEmployeeInfo(results, 'maritalStatus');

					instance._generateEmployeeInfo(results, 'batchType');

					instance._generateEmployeeInfo(results, 'wage', function() {
						return Math.ceil(Math.random() * 15) * 10000
					});

					instance._generateEmployeeInfo(results, 'medicalPlan');

					instance._generateEmployeeInfo(results, 'medicalPlanOption');

					instance._generateEmployeeInfo(results, 'dentalPlan');

					instance._generateEmployeeInfo(results, 'dentalPlanOption');

					instance._generateEmployeeInfo(results, 'visionPlan');

					instance._generateEmployeeInfo(results, 'visionPlanOption');


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

					instance.set('employeeCount', resultsLength);

					for(var i = 0; i < resultsLength; i++) {
						instance._createEmployeeCard(results[i].user, i);
					}
				},

				_generateEmployeeInfo: function(information, fieldName, fieldValue) {
					var instance = this;

					var length = information.length;

					var fieldOptions = instance.get('generatedInfo')[fieldName];

					if (fieldOptions) {
						var fieldOptionsLength = fieldOptions.length;
					}

					for(var i = 0; i < length; i++) {
						if (fieldOptions) {
							information[i].user[fieldName] = fieldOptions[Math.floor(Math.random() * fieldOptionsLength)];
						}
						else {
							information[i].user[fieldName] = fieldValue();
						}
					}
				},

				_createEmployeeCard: function(user, employeeId) {
					var instance = this;

					var employeeList = instance.get('employeeList');

					var employeeCard = A.Lang.sub(
						TPL_EMPLOYEE_LIST_ITEM,
						{
							avatarSrc: user.picture.thumbnail,
							cssClass: '',
							employeeId: employeeId,
							firstName: instance._capitalize(user.name.first),
							jobTitle: user.jobTitle,
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