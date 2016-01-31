var tetrisGame = function(){
	var that = {};
	var block_id = 2; // block_map: 0 = false, 1 = active
	var tetrimino_id = 0;
	var tetrimino_array = [];
	var interval_id = false;
	var game_board = '#board';
	var block_map = [];

	var start = function(){
		init_map();
		create_tetrimino();
		bind_key();
		interval_id = setInterval( function(){ move( 'down' );check_clear(); }, 1000 );
	};

	var init_map = function(){
		for( var index = 0; index < 200; index++ ){
			block_map[index] = 0;
		};
	};

	var map_block = function( row, col, bool ){
		var index = row * 10 + col;
		block_map[index] = bool;
	};

	var check_clear = function(){
		var col = 0;
		for( var index = 0; index < 20; index++ ){
			for( col = 0; col < 10; col++ ){
				if( block_map[ ( index * 10 + col ) ] <= 1 ){
					break;
				}
			}
			if( col === 10 ){
				clear_block( index );
			}
		}
	};

	var clear_block = function( row ){
		for( var col = 0; col < 10; col++ ){
			$( '#block' + block_map[ ( row * 10 + col ) ] ).remove();
			block_map[ ( row * 10 + col ) ] = 0;
		}
		for( var index = ( row - 1 ); index >= 0; index-- ){
			for( var col = 0; col < 10; col++ ){
				var id = block_map[ ( index * 10 + col ) ];
				if( id >= 2 ){
					$( '#block' + id ).css({
						top: ( ( index + 1 ) * 20 ),
						left: ( col * 20 )
					});
					block_map[ ( index * 10 + col ) ] = 0;
					block_map[ ( ( index + 1 ) * 10 + col ) ] = id;
				}
			}
		}
	};

	var create_tetrimino = function(){
		var tetrimino_object = tetrimino();
		tetrimino_object.set_tetrimino_id( tetrimino_id );
		tetrimino_object.create_tetris();
		tetrimino_array.push( tetrimino_object );
		tetrimino_id++;
	};

	var move = function( move_type ){
		tetrimino_object = tetrimino_array[ tetrimino_array.length - 1 ];
		if( move_type === 'rotate' ){
			tetrimino_object.rotate();
		}else{
			tetrimino_object.move( move_type );
		}
	};

	var bind_key = function(){
		$( document ).keydown( function( e ){
			if( e.which === 37 ){
				move( 'left' );
			}else if( e.which === 39 ){
				move( 'right' );
			}else if( e.which === 40 ){
				move( 'down' );
			}else if( e.which === 32 ){
				move( 'rotate' );
			}
		});	

	};

	var get_random_int = function(start, end){
		var result = start + Math.floor( Math.random() * ((end - start) + 1));
		return result;
	};

	var tetrimino = function(){
		var tetriminoObject = {};
		var belong_blocks = [];
		var type = ['I', 'O', 'S', 'Z', 'J', 'L', 'T'];
		var tetrimino_code = {
			'I': [
				{ row: 2, col: 3 },
				{ row: 2, col: 4 },
				{ row: 2, col: 5 },
				{ row: 2, col: 6 }
			],
			'O': [
				{ row: 2, col: 4 },
				{ row: 2, col: 5 },
				{ row: 3, col: 4 },
				{ row: 3, col: 5 }
			],
			'S': [
				{ row: 2, col: 5 },
				{ row: 2, col: 6 },
				{ row: 3, col: 5 },
				{ row: 3, col: 4 }
			],
			'Z': [
				{ row: 2, col: 4 },
				{ row: 2, col: 5 },
				{ row: 3, col: 5 },
				{ row: 3, col: 6 }
			],
			'J': [
				{ row: 2, col: 3 },
				{ row: 3, col: 3 },
				{ row: 3, col: 4 },
				{ row: 3, col: 5 }
			],
			'L': [
				{ row: 2, col: 5 },
				{ row: 3, col: 3 },
				{ row: 3, col: 4 },
				{ row: 3, col: 5 }
			],
			'T': [
				{ row: 2, col: 4 },
				{ row: 3, col: 3 },
				{ row: 3, col: 4 },
				{ row: 3, col: 5 }
			]
		};
		var move_flag = true;
		var rotate_lock_flag = false;
		var move_lock_flag = false;
		var touch_flag = false;
		var cancel_flag = false;
		var min_left = 10;
		var max_left = 0;
		var max_top = 0;
		var tetrimino_id;

		var create_tetris = function(){
			var tetrimino_type = type[get_random_int( 0, 6 )];
			//var tetrimino_type = type[0];
			for( var index = 0; index < 4; index++ ){
				create_block( tetrimino_code[tetrimino_type][index].row, tetrimino_code[tetrimino_type][index].col, tetrimino_type );
			}
		};

		var rotate = function(){
			if( rotate_lock_flag === true ){
				return false;
			}
			move_lock_flag = true;
			var base_index = 2;
			var block_object_base = belong_blocks[base_index];
			
			var min_col = 10;
			var max_col = 0;
			
			for( index = 0; index < 4; index++ ){
				var block_object = belong_blocks[index];
				block_object.set_pre_row( block_object.get_row() );
				block_object.set_pre_col( block_object.get_col() );
				var dx = block_object.get_col() - block_object_base.get_col();
				var dy = block_object.get_row() - block_object_base.get_row();
				var radian = Math.atan2( dy, dx );
				var angle = radian * 180 / Math.PI;	
				var vector = Math.sqrt( Math.pow( dy, 2 ) + Math.pow( dx, 2 ) );
				var add_radian = ( angle + 90 ) * Math.PI / 180;
				var row = block_object_base.get_row() + vector * Math.sin( add_radian );
				var col = block_object_base.get_col() + vector * Math.cos( add_radian );
					
				var result = judge_collision( row, col );
				if( result === 0 || result === 1 ){
					map_block( block_object.get_row(), block_object.get_col(), 0 );
					block_object.move( row, col );
					block_object.set_col( col );
					block_object.set_row( row );
				}else if( result === -1 ){
					cancel_move( index, 'rotate' );
					cancel_flag = true;
					break;
				}
				if( col < min_col ){
					min_col = col;
				}
				if( col > max_col ){
					max_col = col;
				}
			}
			if( cancel_flag === false ){
				max_left = max_col;
				min_left = min_col;
				move_lock_flag = false;
			}
			cancel_flag = false;
		};

		var move = function( move_type ){
			if( move_flag === false || move_lock_flag === true ){
				return false;
			}
			rotate_lock_flag = true;
			if( move_type === 'left' ){
				if( min_left <= 0 ){
					return false;
				}
				var min_col = 10;
				var max_col = 0;
				for( var index = 0; index < 4; index++ ){
					block_object = belong_blocks[index];
					block_object.set_pre_row( block_object.get_row() );
					block_object.set_pre_col( block_object.get_col() );
					var col = block_object.get_col() - 1;
					var result = judge_collision( block_object.get_row(), col )
					if( result === 0 || result === 1 ){
						map_block( block_object.get_row(), block_object.get_col(), 0 );
						block_object.move( block_object.get_row(), col );
						block_object.set_col( col );
					}else{
						cancel_move( index, 'left' );
						cancel_flag = true;
						break;
					}
					if( col < min_col ){
						min_col = col;
					}
					if( col > max_col ){
						max_col = col;
					}
				}
				if( cancel_flag === false ){
					min_left = min_col;
					max_left = max_col;
				}
			}else if( move_type === 'right' ){
				if( max_left >= 9 ){
					return false;
				}
				var min_col = 10;
				var max_col = 0;
				for( var index = 0; index < 4; index++ ){
					block_object = belong_blocks[index];
					block_object.set_pre_row( block_object.get_row() );
					block_object.set_pre_col( block_object.get_col() );
					var col = block_object.get_col() + 1
					var result = judge_collision( block_object.get_row(), col );
					if( result === 0 || result === 1 ){
						map_block( block_object.get_row(), block_object.get_col(), 0 );
						block_object.move( block_object.get_row(), col );
						block_object.set_col( col );
					}else{
						cancel_move( index, 'right' );
						cancel_flag = true;
						break;
					}
					if( col < min_col ){
						min_col = col;
					}
					if( col > max_col ){
						max_col = col;
					}
				}
				if( cancel_flag === false ){
					min_left = min_col;
					max_left = max_col;
				}
			}else if( move_type === 'down' ){
				if( max_top >= 19 ){
					return false;
				}
				var max_row = 0;
				for( var index = 0; index < 4; index++ ){
					block_object = belong_blocks[index];
					block_object.set_pre_row( block_object.get_row() );
					block_object.set_pre_col( block_object.get_col() );
					var row = block_object.get_row() + 1;
					var result = judge_collision( row, block_object.get_col() );
					if( result === 0 || result === 1 ){
						map_block( block_object.get_row(), block_object.get_col(), 0 );
						block_object.move( row, block_object.get_col() );
						block_object.set_row( row );
					}else{
						cancel_move( index, 'down' );
						cancel_flag = true;
						break;
					}
					// touch detection
					var result = judge_collision( ( row + 1 ), block_object.get_col() );
					if( ( result !== 0 && result !== 1 ) || touch_flag === true ){
						move_flag = false;
						touch_flag = true;
						map_block( row, block_object.get_col(), block_object.get_block_id() );
						touch_process( index );
					}
					if( row > max_row ){
						max_row = row;
					}
				}
				max_top = max_row;
				if( max_top === 19 || move_flag === false ){
					move_flag = false;
					create_tetrimino();
				}
			}
			rotate_lock_flag = false;
			cancel_flag = false;
		};

		var cancel_move = function( range, move_type ){
			var block_object_base = belong_blocks[2];
			for( var index = 0; index < range; index++ ){
				var block_object = belong_blocks[index];
				var row = 0;
				var col = 0;
				if( move_type === 'down' ){
					row = block_object.get_row() - 1;
					col = block_object.get_col();
				}else if( move_type === 'left' ){
					row = block_object.get_row();
					col = block_object.get_col() + 1;
				}else if( move_type === 'right' ){
					row = block_object.get_row();
					col = block_object.get_col() - 1;
				}else if( move_type === 'rotate' ){
					row = block_object.get_pre_row();
					col = block_object.get_pre_col();
				}
				map_block( block_object.get_row(), block_object.get_col(), 0 );
				block_object.move( row, col );
				block_object.set_row( row );
				block_object.set_col( col );
			}
		};

		var touch_process = function( range ){
			for( var index = 0; index < range; index++ ){
				var block_object = belong_blocks[index];
				map_block( block_object.get_row(), block_object.get_col(), block_object.get_block_id() );
			}
		};

		var judge_collision = function( row, col ){
			if( col < 0 || col > 9 ){
				return -1;
			}	
			var index = row * 10 + col;
			return block_map[index];	
		};

		var create_block = function( row, col, type ){
			var block_object = block();
			block_object.set_row( row );	
			block_object.set_col( col );	
			block_object.set_block_id( block_id );
			block_object.construct( type );
			belong_blocks.push( block_object );
			block_id++;	
		};

		var set_move_flag = function( value ){
			move_flag = value;
		};

		var get_move_flag = function(){
			return move_flag;
		};
		
		var set_tetrimino_id = function( value ){
			tetrimono_id = value;
		};

		var get_tetrimino_id = function(){
			return tetrimino_id;
		};

		tetriminoObject.create_tetris = create_tetris;
		tetriminoObject.move = move;
		tetriminoObject.rotate = rotate;
		tetriminoObject.set_move_flag = set_move_flag;
		tetriminoObject.get_move_flag = get_move_flag;
		tetriminoObject.set_tetrimino_id = set_tetrimino_id;
		tetriminoObject.get_tetrimino_id = get_tetrimino_id;

		return tetriminoObject;
	};

	var block = function(){
		var blockObject = {};
		var width = 20;
		var height = 20;
		var row = 0;
		var col = 0;
		var pre_row = 0;
		var pre_col = 0;
		var block_id;
		var type_color = {
			'I': 'skyblue',
			'O': 'yellow',
			'S': 'green',
			'Z': 'red',
			'J': 'blue',
			'L': 'orange',
			'T': 'purple'
		};
		
		var construct = function( type ){
			$( game_board ).append( '<span class="block" id="block' + block_id + '"></span>' );
			$( '#block' + block_id ).css({
				'left': ( col * width ),
				'top': ( row * height ),
				'background': type_color[type]
			});
			map_block( row, col, 1 );
		};

		var move = function( row, col ){
			$( '#block' + block_id ).css({
				'left': ( col * width ),
				'top': ( row * height )
			});
			map_block( row, col, 1 );
			
		};
	
		var get_width = function(){
			return width;
		};

		var get_height = function(){
			return height;
		};

		var set_row = function( value ){
			row = value;
		};

		var get_row = function(){
			return row;
		}; 
	
		var set_col = function( value ){
			col = value;
		};

		var get_col = function(){
			return col;
		};
		
		var set_pre_row = function( value ){
			pre_row = value;
		};

		var get_pre_row = function(){
			return pre_row;
		}; 
	
		var set_pre_col = function( value ){
			pre_col = value;
		};

		var get_pre_col = function(){
			return pre_col;
		};		
	
		var set_block_id = function( value ){
			block_id = value;
		};

		var get_block_id = function(){
			return block_id;
		};

		blockObject.construct = construct;
		blockObject.move = move;
		blockObject.get_width = get_width;
		blockObject.get_height = get_height;
		blockObject.set_row = set_row;
		blockObject.get_row = get_row;
		blockObject.set_col = set_col;
		blockObject.get_col = get_col;
		blockObject.set_pre_row = set_pre_row;
		blockObject.get_pre_row = get_pre_row;
		blockObject.set_pre_col = set_pre_col;
		blockObject.get_pre_col = get_pre_col;
		blockObject.set_block_id = set_block_id;
		blockObject.get_block_id = get_block_id;

		return blockObject;
	};

	that.start = start;

	return that;

};

window.onload = function(){
	var gameObject = tetrisGame();
	gameObject.start();
};
