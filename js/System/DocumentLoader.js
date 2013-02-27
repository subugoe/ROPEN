/**
 * The DocumentLoader monitors asynchronous ajax processes. It ensures that responses, which are not required anymore, do not trigger any changes.
 *
 * @constructor
 * @this {DocumentLoader}
 */
function DocumentLoader(){
	this.processId = -1;
	this.processes = [];
}

/**
 * Starts a new process.
 *
 * @this {DocumentLoader}
 */
DocumentLoader.prototype.startProcess = function(){
	this.process = {
		id: ++this.processId,
		active: true
	};
	this.processes.push(this.process);
	return this.process;
};

/**
 * Stops the actual running process.
 *
 * @this {DocumentLoader}
 */
DocumentLoader.prototype.stopProcess = function(){
	if( typeof this.process != 'undefined' ){
		this.processes[this.process.id].active = false;
	}
};
