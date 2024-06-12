$(document).ready(function() {
    var editModal = new bootstrap.Modal(document.getElementById('editor'), {});
    var deleteModal = new bootstrap.Modal(document.getElementById('deleter'), {});
    var roleNames = { '1': 'USER', '2': 'ADMIN' };
    var csrfToken = $('input[name="_csrf"]').val();

    $(document).on('click', '.editBtn', function() {
        var userId = $(this).data('user-id');
        fetch('api/users/' + userId)
            .then(response => response.json())
            .then(user => {
                $('#id').val(user.id);
                $('#first-name').val(user.firstName);
                $('#last-name').val(user.lastName);
                $('#age').val(user.age);
                $('#email').val(user.email);
                $('#roles').val(user.roles.map(role => role.id));
                editModal.show();
            })
            .catch(error => console.error('There has been a problem with your fetch operation:', error));
    });

    $(document).on('submit', '#editForm', function(event) {
        event.preventDefault();
        var selectedRoles = $('#roles').val();
        if (!selectedRoles || selectedRoles.length === 0) {
            selectedRoles = ['1'];
        }
        var rolesArray = Array.isArray(selectedRoles) ? selectedRoles : [selectedRoles];
        var formData = {
            id: Number($('#id').val()),
            firstName: $('#first-name').val(),
            lastName: $('#last-name').val(),
            age: Number($('#age').val()),
            email: $('#email').val(),
            password: $('#password').val(),
            roles: rolesArray.map(roleId => {
                return {
                    id: Number(roleId),
                    name: roleNames[roleId]
                };
            })
        };
        let jsonData = JSON.stringify(formData);
        console.log(jsonData);
        editModal.hide();
        fetch('api/users', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: jsonData
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return fetch('api/users/' + formData.id);
        }).then(response => response.json())
            .then(user => {
                var row = document.getElementById('user-' + user.id);
                row.cells[0].innerText = user.id;
                row.cells[1].innerText = user.firstName;
                row.cells[2].innerText = user.lastName;
                row.cells[3].innerText = user.age;
                row.cells[4].innerText = user.email;
                row.cells[5].innerHTML = user.roles.map(roleId => `<span>${roleNames[roleId]}</span>`).join(', ');
            }).catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });

    $(document).on('click', '.deleteBtn', function() {
        var userId = $(this).data('user-id');
        fetch('api/users/' + userId)
            .then(response => response.json())
            .then(user => {
                // Заполняем форму данными пользователя
                $('#delete-id').val(user.id);
                $('#delete-first-name').val(user.firstName);
                $('#delete-last-name').val(user.lastName);
                $('#delete-age').val(user.age);
                $('#delete-email').val(user.email);
                $('#delete-roles').val(user.roles.map(role => role.id));

                deleteModal.show();
            })
            .catch(error => console.error('There has been a problem with your fetch operation:', error));
    });

    $(document).on('submit', '#deleteForm', function(event) {
        event.preventDefault();

        var userId = $('#delete-id').val();

        deleteModal.hide();

        fetch('api/users/' + userId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            var row = document.getElementById('user-' + userId);
            row.parentNode.removeChild(row);
        }).catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });

    $(document).on('submit', '#newUserForm', function(event) {
        event.preventDefault();
        event.stopPropagation();
        var rolesArray = $('#roles2 option:selected').map(function() {
            return {
                id: Number($(this).val()),
                name: $(this).text()
            };
        }).get();
        var formData = {
            firstName: $('#first-name2').val(),
            lastName: $('#last-name2').val(),
            age: Number($('#age2').val()),
            email: $('#email2').val(),
            password: $('#password2').val(),
            roles: rolesArray
        };

        let jsonData = JSON.stringify(formData);
        console.log(jsonData);

        fetch('api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: jsonData
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return response.json();
        }).then(user => {
            var table = document.getElementById('users-table');
            var row = table.insertRow();
            row.id = 'user-' + user.id;
            row.insertCell(0).innerText = user.id;
            row.insertCell(1).innerText = user.firstName;
            row.insertCell(2).innerText = user.lastName;
            row.insertCell(3).innerText = user.age;
            row.insertCell(4).innerText = user.email;
            row.insertCell(5).innerHTML = user.authorities.map(role => `<span>${role.name}</span>`).join(', ');
            var editCell = row.insertCell(6);
            var deleteCell = row.insertCell(7);
            var editButton = document.createElement('button');
            editButton.className = 'btn btn-success editBtn';
            editButton.setAttribute('data-toggle', 'modal');
            editButton.setAttribute('data-user-id', user.id);
            editButton.innerText = 'Edit';
            editCell.appendChild(editButton);
            var deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger deleteBtn';
            deleteButton.setAttribute('data-toggle', 'modal');
            deleteButton.setAttribute('data-user-id', user.id);
            deleteButton.innerText = 'Delete';
            deleteCell.appendChild(deleteButton);
            $('#myTab a[href="#table"]').tab('show');
        }).catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });
});
