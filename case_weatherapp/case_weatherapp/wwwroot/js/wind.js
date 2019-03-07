$(document).ready(function() {
    loadData();
    console.log("Testar");
});
function loadData()
{
    $.ajax({
        url: '/Home/List',
        type: "GET",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function(result){
            console.log(result);
        },
        error: function(error) {
            console.log(JSON.stringify(error));
        }
    })
}
