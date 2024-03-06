//Date Function
exports.getDate = getDate

function getDate(){
    let today = new Date()

    let option = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    var day = today.toLocaleDateString("en-US", option)

    return day
}