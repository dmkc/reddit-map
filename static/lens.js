$(function(){
    // Create map panel on the right
    var map          = $( document.createElement('div')).prop('id', 'reddit-map'),
        content      = $( document.createElement('div')).addClass('reddit-map-content'),
        lens_wrapper = $( document.createElement('div')).addClass('reddit-map-lens-wrapper'),
        lens         = $( document.createElement('div')).addClass('reddit-map-lens'),
        clicking     = false,
        dragging     = false,
        click_offset = undefined,
        Lens = {
            opts: {}
        },
        Map = {},

        // boolean flags useful for debugging
        debug = { 
            scroll_map: true
        };
        
   // Comment DOM nodes
        reddit_content = $('.commentarea').children('.sitetable')
        reddit_comments = reddit_content.children('.comment'),
        init = function() {
            init_map();
            init_lens();
        },

        init_map = function() { 
            generate_map( content, reddit_comments );
            setInterval( function(){ scroll_map() }, 20 );
        },

        init_lens = function() {
            lens.mousedown( function(e){
                clicking = true;
                click_offset = e.clientY-lens.position().top;
                lens.addClass( 'grabbing' );
                $(document).disableSelection();
                
            }).mouseup( function(){
                clicking = false;
                lens.removeClass( 'grabbing' );
                $(document).enableSelection();

            }).mousemove( function(e){
                e.preventDefault();
                if ( !clicking ) return;

                var lens_offset   = lens.offset(),
                    lens_pos = lens.position();

                dragging = true;
                // don't let the lens move beyond screen bounds
                if ( lens_pos.top < 0 || lens_pos.top > $(window).height() )
                    return false;

                // Cancel dragging outside the document window
                if ( lens_offset.left > $(document).width() || 
                    lens_pos.top > $(document).height() ) {
                    dragging = false;
                    return false;
                }

                var offset_top = Math.max( e.clientY - click_offset, 0 );
                
                if ( offset_top < 0 )
                    return;

                lens.css( 'top', offset_top );
            });

            resize_lens();

            lens.bind( 'drag', function lens_drag_handler(e,ui) {
                dragging = true;
            });

            //setInterval( function(){ lens_move_handler() }, 20 );
            setInterval( function(){ lens_scroll_handler() }, 50 );
        },

        generate_map = function( content, comments ) {
            Lens.opts.map_scale = lens.height() / $(window).height();
            //
            // Create spacers for header and footer
            var header = $( document.createElement('div') ).addClass('reddit-map-spacer'),
                footer = header.clone()
                map_scale = Lens.opts.map_scale;

            header.css( 'height', Math.floor( $('#header').height() * map_scale ) );
            footer.css( 'height', Math.floor( $('.footer-parent').height() * map_scale ) );

            content.append( header );
            generate_comments( content, comments );
            content.append( footer );
            
        },

        generate_comments = function( parent, nodes ) {

            // Walk through all the comments creating a map based on
            // each comment's height and descendants
            $.each( nodes, function(){//{{{
                var $node = $(this),
                    map_scale = Lens.opts.map_scale,
                    comment_text = $node.children('.entry').find('.usertext-body'),
                    comment_children = $node.children('.child').children('.sitetable').children('.comment'),
                    comment  = $( document.createElement('div')).addClass('reddit-map-comment'),
                    element  = $( document.createElement('div')).addClass('reddit-map-comment-element'), 
                    children = $( document.createElement('div')).addClass('reddit-map-comment-children');

                // Set map elements' height to match with global height ratio
                var elm_height = comment_text.height();
                element.height( Math.floor( map_scale * elm_height ) );

                comment.append( element ).append( children );
                // keep track of the original DOM node for the comment
                comment.data( 'parent_comment', this );

                // hightlight comment
                element.hover( function(e) {
                    comment_text.css( 'background', '#faa' );
                }, function(e) {
                    comment_text.css( 'background', '#fff' );
                });

                parent.append( comment );

                // recurse on the comment's children
                if( comment_children.length != 0 ) {
                    generate_comments( children, comment_children );
                }//}}}

            });
        },

        // Scroll map proportionally with the document
        scroll_map = function() {
            if ( !debug.scroll_map ) return;
            var lens_ratio = ( content.height()- $(window).height() ) / 
                ( reddit_content.height() ),
                offset = Math.floor( window.pageYOffset * lens_ratio );

            content.css( 'margin-top', -offset );
        }
        
        // Scroll document if user moves lens
        lens_move_handler = function() {
            if ( dragging ) {
                dragging = false;
                var lens_pos = lens.position(),
                    pos = lens_pos.top  * Math.floor( 
                            ( $(document).height() / ($(window).height() - lens.height()) ) );

                window.scrollTo( 0, pos );
            }
        },

        // Resize lens based on window height
        resize_lens = function(e){
            var lens_height = Math.floor( $(window).height() * 
                                 ( content.height() / reddit_content.height() ) );
            lens.height( lens_height );
        },
        
        // Move lens as document scrolls
        lens_scroll_handler = function() {
            if ( dragging ) return;
            var lens_top = Math.floor( window.pageYOffset * 
                          ( ($(window).height() - lens.height()) / reddit_content.height() ) );
            lens.css( 'top', lens_top );
        }

    map.append(  content );
    map.insertBefore( $(document.body).children().eq(0));

    lens_wrapper.append( lens );
    lens_wrapper.insertBefore( $(document.body).children().eq(0) );

    window.reddit_map = {
        debug: debug
    };

    // Vroom!
    init();

});

