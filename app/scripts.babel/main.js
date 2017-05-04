function clock_tick() {
    let buf = new Date()
    $('#clock_hours').text(pad(buf.getHours(), 2))
    $('#clock_minutes').text(pad(buf.getMinutes(), 2))
}

function pad(num, size) {
    let s = num+'';
    while (s.length < size) s = '0' + s;
    return s;
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function load_forecast() {
    let weather_temp = $('#weather_temperature')
    let weather_icon = $('#weather_icon')
    chrome.storage.local.get(['weather_icon', 'weather_temp'], (ch) => {
        weather_temp.html(ch['weather_temp'] + '&deg;C')
        weather_icon.attr('src', 'http:' + ch['weather_icon'])
    })
}

function load_slogan() {
    chrome.storage.local.get(['day_slogan'], (ch) => {
        $('#slogan_input').val(ch['day_slogan'])
    })
}

function load_tasks() {
    chrome.storage.local.get('tasks', (res) => {
        console.log(res)
        if (res.tasks) {
            for (let tid in res.tasks) {
                $('#tasks').append(`<div class='task-container' data-gid=${tid}>
                    <div class='card-panel task ${get_random_color()}'>
                        <div class='task-text'>${marked(res.tasks[tid])}</div>
                        <div class='done-btn material-icons'>clear</div>
                    </div>
                </div>`)
                
            }
            $(".done-btn").off('click')
            $(".done-btn").click(remove_task)
        }
    })

}

function get_forecast() {
    let weather_temp = $('#weather_temperature')
    let weather_icon = $('#weather_icon')
    $.post({
        url: `http://api.apixu.com/v1/current.json?key=90d68996fcc94f26852110529170405&q=Kiev`,
        dataType: 'json'
    })
    .then((res) => {
        console.log(res)
        weather_temp.html(res.current.feelslike_c + '&deg;C')
        weather_icon.attr('src', 'http:' + res.current.condition.icon)

        $('#weather_forecast').css('display', 'flex')
        $('#weather_preloader').css('display', 'none')

        chrome.storage.local.set({
            'weather_temp': res.current.feelslike_c,
            'weather_icon': res.current.condition.icon
        })
    }).catch( (err) => console.log(err) )
}

function remove_task(e) {
    let gid = $(e.target).parent().parent().attr('data-gid')
    console.log(gid)
    chrome.storage.local.get(['tasks'], (res) => {
        chrome.storage.local.remove('tasks', () => {
            console.log(res)
            let b = res['tasks']
            delete b[gid]
            $(e.target).parent().parent().remove()
            console.log(b)
            chrome.storage.local.set({tasks: b})
        })
        
    })

}

function get_random_color() {
    let items = ['teal', 'red', 'pink', 'purple', 'indigo', 'blue', 'cyan', 'amber']
    return items[Math.floor(Math.random()*items.length)]
}


chrome.storage.onChanged.addListener( (ch) => {
    if ('weather_temp' in ch) {
        let weather_temp = $('#weather_temperature')
        let weather_icon = $('#weather_icon')

        weather_temp.html(ch['weather_temp']['newValue'] + '&deg;C')
        weather_icon.attr('src', 'http:' + ch['weather_icon']['newValue'])
    }
    if ('day_slogan' in ch) {
        $('#slogan_input').val(ch['day_slogan']['newValue'])
    }

    if ('tasks' in ch) {
        $(".task-container").remove()
        load_tasks()
    }
})

$('#weather_forecast').click( (e) => {
    $('#weather_forecast').css('display', 'none')
    $('#weather_preloader').css('display', 'block')
    get_forecast()
})

$('#slogan_input').change( (e) => {
    chrome.storage.local.set({'day_slogan': $('#slogan_input').val()})
})


$('#add_task_btn').click( (e) => {
    console.log('New task')
    $("#modal_note").modal("open")
})

$("#task_text_end").click( () => {
    let t = $("#textarea_task").val()
    $("#textarea_task").val("")


    chrome.storage.local.get(['tasks'], (res) => {
        console.log(res)
        let b = res['tasks'] ? res : {'tasks': {}}

        let new_id = guid()
        b.tasks[new_id] = t
        chrome.storage.local.set(b)
        $('#tasks').append(`<div class='task-container' data-gid=${new_id}>
                    <div class='card-panel task ${get_random_color()}'>
                        <div class='task-text'>${marked(t)}</div>
                        <div class='done-btn material-icons'>clear</div>
                    </div>
                </div>`)
        $(".done-btn").click(remove_task)
    })
})

$(".done-btn").click(remove_task)

$("#modal_note").modal()
clock_tick()
load_forecast()
load_slogan()
load_tasks()




let clock_interbal_id = setInterval(clock_tick, 1000)



