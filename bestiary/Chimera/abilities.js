/*
*
*	Chimera abilities
*
*/
abilities[45] =[

// 	First Ability: Cyclic Duality
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onStartPhase",

	//	require() :
	require : function(){
		return this.testRequirements();
	},

	//	activate() : 
	activate : function() {
		this.tokens = [false,false,false];
	},

	abilityTriggered : function(id){
		if(this.used) return;
		if(this.tokens[id]){
			this.end();
			for (var i = 0; i < this.tokens.length; i++) {
				this.creature.abilities[i+1].used  = this.tokens[i];
			};
			G.UI.checkAbilities();
		}else{
			this.tokens[id] = true;
			this.creature.abilities[id+1].setUsed(false);
		}
	},

	tokens : [false,false,false],
},



//	Second Ability: Tooth Fairy
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		crush : 20,
	},

	//	require() :
	require : function(){
		if( !this.testRequirements() ) return false;

		if( !this.atLeastOneTarget( G.grid.getHexMap(this.creature.x-3,this.creature.y-2,0,false,frontnback3hex),"ennemy" ) ){
			this.message = G.msg.abilities.notarget;
			return false;
		}

		//Duality
		if( this.creature.abilities[0].used ){
			//this.message = "Duality has already been used";
			//return false;
		}else{
			this.setUsed(false);
		}

		return true;
	},

	//	query() :
	query : function(){
		var chimera = this.creature;

		G.grid.queryCreature({
			fnOnConfirm : this.activate, //fnOnConfirm
			team : 0, //Team, 0 = ennemies
			id : chimera.id,
			flipped : chimera.flipped,
			hexs : G.grid.getHexMap(chimera.x-3,chimera.y-2,0,false,frontnback3hex),
			args : {ability: this}
		});
	},


	//	activate() : 
	activate : function(target,args) {
		var ability = args.ability;

		ability.creature.abilities[0].abilityTriggered(0);

		ability.end();

		var damage = new Damage(
			ability.creature, //Attacker
			"target", //Attack Type
			ability.damages, //Damage Type
			1, //Area
			[]	//Effects
		);
		target.takeDamage(damage);
	},
},



//	Thirt Ability: Power Note
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		sonic : 20,
	},

	directions : [0,1,0,0,0,0],

	//	require() :
	require : function(){
		if( !this.testRequirements() ) return false;

		if( !this.testDirection({ team : "ennemy", directions : this.directions }) ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		//Duality
		if( this.creature.abilities[0].used ){
			//this.message = "Duality has already been used";
			//return false;
		}else{
			this.setUsed(false);
		}
		return true;
	},

	//	query() :
	query : function(){
		var chimera = this.creature;

		G.grid.queryDirection({
			fnOnConfirm : this.activate, //fnOnConfirm
			flipped : chimera.player.flipped,
			team : 0, //enemies
			id : chimera.id,
			requireCreature : false,
			x : chimera.x,
			y : chimera.y,
			directions : this.directions,
			args : {chimera:chimera, ability: this}
		});
	},


	//	activate() : 
	activate : function(path,args) {
		var ability = args.ability;

		ability.creature.abilities[0].abilityTriggered(1);
		ability.end();

		crea = path.last().creature;

		var damage = new Damage(
			ability.creature, //Attacker
			"target", //Attack Type
			ability.damages, //Damage Type
			1, //Area
			[]	//Effects
		);
		crea.takeDamage(damage);
	},
},



//	Fourth Ability: Chain Lightning
{
	//	Type : Can be "onQuery","onStartPhase","onDamage"
	trigger : "onQuery",

	damages : {
		shock : 20,
	},

	directions : [0,1,0,0,0,0],
	
	require : function(){
		if( !this.testRequirements() ) return false;

		if( !this.testDirection({ team : "ennemy", directions : this.directions }) ){
			this.message = G.msg.abilities.notarget;
			return false;
		}
		//Duality
		if( this.creature.abilities[0].used ){
			//this.message = "Duality has already been used";
			//return false;
		}else{
			this.setUsed(false);
		}
		return true;
	},

	//	query() :
	query : function(){
		var chimera = this.creature;

		G.grid.queryDirection({
			fnOnConfirm : this.activate, //fnOnConfirm
			flipped : chimera.player.flipped,
			team : 0, //enemies
			id : chimera.id,
			requireCreature : false,
			x : chimera.x,
			y : chimera.y,
			directions : this.directions,
			args : {chimera:chimera, ability: this}
		});
	},


	//	activate() : 
	activate : function(path,args) {
		var ability = args.ability;

		ability.creature.abilities[0].abilityTriggered(2);

		ability.end();


		var targets = [];
		targets.push(path.last().creature);
		var nextdmg = $j.extend({},ability.damages); 

		for (var i = 0; i < targets.length; i++) {
			console.log(targets);
			var trg = targets[i];

			var damage = new Damage(
				ability.creature, //Attacker
				"target", //Attack Type
				nextdmg, //Damage Type
				1, //Area
				[] //Effects
			);
			nextdmg = trg.takeDamage(damage);

			if(nextdmg.damages == undefined) break;
			if(nextdmg.damages.total <= 0) break;
			delete nextdmg.damages.total;
			nextdmg = nextdmg.damages;

			nextTargets = ability.getTargets(trg.adjacentHexs(1));

			if(nextTargets.length == 0) break;

			var bestTarget = { stats:{ defense:-99999, shock:-99999 } };
			for (var j = 0; j < nextTargets.length; j++) {
				if (typeof nextTargets[j] == "undefined") continue // Skip empty ids.
				if (targets.indexOf(nextTargets[j].target) != -1) continue
				if (nextTargets[j].target.stats.shock+nextTargets[j].target.stats.defense <= bestTarget.stats.shock+bestTarget.stats.defense) continue
				var bestTarget = nextTargets[j].target;
			};

			if( bestTarget instanceof Creature ){
				targets.push(bestTarget);
			}else{
				break;
			}
		};

	},
}

];
