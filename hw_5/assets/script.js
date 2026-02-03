const list = document.querySelector('.tasks-list');
const [text, prio] = ['task-text', 'priority'].map(id => document.getElementById(id));
const edit = document.querySelector('.edit-task');
const createButton = document.querySelector('.create-btn');
const cancelButton = document.querySelector('.cancel-btn');
const saveButton = document.querySelector('.save-btn');
let currentEditItem = null;

list.addEventListener('click', function(e)
{
	const item = e.target.closest('.item');
	if (!item) return;

	if (e.target.classList.contains('delete-btn'))
		item.remove();

	else if (e.target.classList.contains('edit-btn')) 
	{
        const taskParagraph = item.querySelector('p');
        edit.style.display = 'block';
        text.value = taskParagraph.textContent;
        prio.checked = taskParagraph.classList.contains('priority-text');
        text.focus();
        currentEditItem = item;
    }

	else
		item.querySelector('p').classList.toggle('completed');			
})

createButton.addEventListener('click', function() {
    edit.style.display = 'block';
    text.value = '';
    prio.checked = false;
    text.focus();
    currentEditItem = null;
});

cancelButton.addEventListener('click', function() {
    edit.style.display = 'none';
    text.value = '';
    prio.checked = false;
    currentEditItem = null;
});

saveButton.addEventListener('click', function() 
{
    const txt = text.value.trim();

    if (!txt)
        return;
    
    if (currentEditItem) 
    {
        const taskParagraph = currentEditItem.querySelector('p');
        taskParagraph.textContent = txt;
        
        if (prio.checked)
            taskParagraph.classList.add('priority-text');
        else
            taskParagraph.classList.remove('priority-text');
    } 
    
    else 
    {
    	const newItem = document.createElement('li');
    	newItem.className = 'item';

		const paragraph = document.createElement('p');
		paragraph.textContent = txt;
		if (prio.checked)
		    paragraph.classList.add('priority-text');

		const buttonDiv = document.createElement('div');
		buttonDiv.innerHTML = `
		    <button class="edit-btn">🖊</button>
		    <button class="delete-btn">🗑</button>
		`;

		newItem.appendChild(paragraph);
		newItem.appendChild(buttonDiv);

		list.prepend(newItem);
    }
    
    edit.style.display = 'none';
    text.value = '';
    prio.checked = false;
    currentEditItem = null;
});
