import { elCreate } from "@dpsys/js-utils/element/util";
import { cLog, pause } from "@dpsys/js-utils/misc";


POKRAČ: TYTO FCE BUDOU SOUČÁSTÍ A BUDOU POUŽITY JAKO VÝCHOZÍ

export async function loaderShow (id, zpravaTrvaDlouho)
{																				// cLog('id', id, loaderShow); 
	let inHTML = '<div class="anim"> <img src="hhhhhh"> </div>';									
		inHTML += '<div class="sdeleni">'+zpravaTrvaDlouho+'</div>';
	
	let sysPrac = elCreate('div', {'data-ajax-probiha': id}, inHTML);					
	document.body.appendChild(sysPrac);
	await pause(0);
	sysPrac.classList.add('show');
}

export async function loaderHide (id)
{																				// cLog('id', id, loaderHide);
	let	sysPrac = document.querySelector('[data-ajax-probiha="'+id+'"]');
	if (sysPrac) 
	{		
		sysPrac.classList.remove('show');
		await pause(450);
		sysPrac.remove();
	}		 
}



export async function pageInteractionDisable (id, loaderShowAfterMs)
{
	// cLog('id', id, pageInteractionDisable);
	let serverPracujeEl = elCreate ('div', {id: 'ajax_pageInteractionDisabled_'+id});
	document.body.appendChild(serverPracujeEl);
	pause(loaderShowAfterMs);	TOTO NENÍ TŘEBA, VIZUALIZACI ZAJIŠŤUJE loaderShow/Hide
	serverPracujeEl.classList.add('show');
	
	return serverPracujeEl;
}

export async function pageInteractionEnable (id)
{
	// cLog('id', id, pageInteractionEnable);
	let  serverPracujeEl = document.getElementById('ajax_pageInteractionDisabled_'+id);
		serverPracujeEl.classList.remove('show');
		await pause(450);	TOTO NENÍ TŘEBA, VIZUALIZACI ZAJIŠŤUJE loaderShow/Hide
		serverPracujeEl.remove();	
}














