$(document).ready(function() {
  $(".fill-form").on('click', function() {
    if ($(this).hasClass('term-subject')) {
      $('#subject').val($(this).attr('data'));
    } else if ($(this).hasClass('term-predicate')) {
      $('#predicate').val($(this).attr('data'));
    } else if ($(this).hasClass('term-object')) {
      $('#object').val($(this).attr('data'));
    }
  });

  $(".clear-term").on('click', function() {
    if ($(this).hasClass('term-subject')) {
      $('#subject').val('');
    } else if ($(this).hasClass('term-predicate')) {
      $('#predicate').val('');
    } else if ($(this).hasClass('term-object')) {
      $('#object').val('');
    }
  });
});