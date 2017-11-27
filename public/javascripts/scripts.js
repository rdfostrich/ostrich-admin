$(document).ready(function() {
  $('.fill-form').on('click', function() {
    if ($(this).hasClass('term-subject')) {
      $('#subject').val($(this).attr('data'));
    } else if ($(this).hasClass('term-predicate')) {
      $('#predicate').val($(this).attr('data'));
    } else if ($(this).hasClass('term-object')) {
      $('#object').val($(this).attr('data'));
    }
  });

  $('.clear-term').on('click', function() {
    if ($(this).hasClass('term-subject')) {
      $('#subject').val('');
    } else if ($(this).hasClass('term-predicate')) {
      $('#predicate').val('');
    } else if ($(this).hasClass('term-object')) {
      $('#object').val('');
    }
  });
  
  $('button.page-first').on('click', function() {
    $('#offset').val(0);
    $('form.query').submit();
  });
  $('button.page-previous').on('click', function() {
    $('#offset').val(Math.max(0, parseInt($('#offset').val(), 10) - parseInt($('#limit').val(), 10)));
    $('form.query').submit();
  });
  $('button.page-next').on('click', function() {
    $('#offset').val(parseInt($('#offset').val(), 10) + parseInt($('#limit').val(), 10));
    $('form.query').submit();
  });
});