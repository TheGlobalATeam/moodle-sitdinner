<?php

require_once($CFG->libdir . '/pagelib.php');

class block_sitdinner extends block_base {

	private $jsWorkerLoaded = false;

    public function init() {
		GLOBAL $PAGE;

        $this->title = get_string('sitdinner', 'block_sitdinner');




    }

	public function applicable_formats() {
        return array('all' => true);
    }

	public function get_content() {

        global $CFG, $OUTPUT, $USER, $DB, $PAGE;

		//loading js file, while preventing moodle catching. probably a better way somewhere...
		if(!$this->jsWorkerLoaded){
			$this->jsWorkerLoaded = true;
			$PAGE->requires->js('/blocks/sitdinner/main.js?'.rand());
		}

		//not working way
		//$this->page->require->requiresjs('/blocks/sitdinner/main.js');

        if ($this->content !== null) {
          return $this->content;
        }

        $this->content         =  new stdClass;
        //$this->content->text   = 'The content of our sitdinner block!';

        //first element with no .=, just =
        $this->content->text = "<br><b>Todays Dinner:</b> <br>";


		$data = file_get_contents('https://www.sit.no/gjovik/mat');

		$tagNameStart = "dishes__single-day";
		$tagPosStart = strpos ($data, $tagNameStart);
		$tagPosStart += strlen($tagNameStart) + 2; //+2 for removing rest of tag

		$tagNameEnd = "dishes__week-link";
		$tagPosEnd = strpos ($data, $tagNameEnd);
		$tagPosEnd -= strlen($tagNameEnd) - 7;//-7 for removing rest of tag

		$subPart = substr($data, $tagPosStart, $tagPosEnd - $tagPosStart);

		$this->content->text .= $subPart;



        $this->content->footer = '';

        return $this->content;

    }
}
