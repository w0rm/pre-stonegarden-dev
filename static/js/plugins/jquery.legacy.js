define(["jquery"], function($) {

  $.fn.legacy = function(){

    var $legacy = $(this)
      , $step2 = $legacy.find(".js-step2")
      , $results = $legacy.find(".js-results")
      , $region = $legacy.find(".js-region")
      , $surname = $legacy.find(".js-surname")
      , $notaries = $legacy.find(".js-notary")

    function performSearch(val) {
        var found = false
        $notaries.each(function(){
            var $notary = $(this)
              , letters = $notary.data("legacy_letters").split(",")
              , first_letter = val.charAt(0).toUpperCase()
              , region_id = $notary.data("region_id")
              , test = $.inArray(first_letter, letters) >= 0 &&
                       region_id == $region.val()
            found = found || test
            $notary.toggleClass("is-hidden", !test)
        })
        $(".js-results").toggleClass("is-hidden", !found)
        $(".js-fail").toggleClass("is-hidden", found)
    }

    $region.change(function(){
        var val = $(this).val();
        if (!val) {
            $(".js-step2, .js-results, .js-fail").addClass("is-hidden")
        } else {
            $(".js-results").addClass("is-hidden")
            $(".js-step2").removeClass("is-hidden")
        }
    })

    $step2.submit(function(e){
        var val = $surname.val()
        e.preventDefault();
        if (!val) {
            $(".js-results, .js-fail").addClass("is-hidden")
        } else {
            performSearch(val)
        }
    })
  }

  return $.fn.legacy

})
