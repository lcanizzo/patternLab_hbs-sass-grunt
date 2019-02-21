(function($) {
  'use strict';
  
  $(function() {
    console.log('buttons.js loading');
    
    var $btnTest = $('.btn--basic');
  
  
    $btnTest.on('click', function(event) {
      var $this = $(this);
      
      $this.css('background', 'purple');
      
      setTimeout(function() {
        $this.css('background', 'red');
      }, 500);
    });
   
    // end document.ready
  });
})(jQuery);
