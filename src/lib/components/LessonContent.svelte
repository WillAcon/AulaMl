<script lang="ts">
	import type { Block } from '$lib/types';
	import { buildToc, inline } from '$lib/md';
	import CodeBlock from './CodeBlock.svelte';
	import Callout from './Callout.svelte';
	import CompareBlock from './CompareBlock.svelte';
	import DiffBlock from './DiffBlock.svelte';
	import TracePlayer from './TracePlayer.svelte';
	import SliceViz from './SliceViz.svelte';
	import MemoryViz from './MemoryViz.svelte';
	import MatrixViz from './MatrixViz.svelte';
	import Quiz from './Quiz.svelte';
	import FillExercise from './FillExercise.svelte';
	import Exercise from './Exercise.svelte';
	import Icon from './Icon.svelte';

	let { blocks, lessonId }: { blocks: Block[]; lessonId: string } = $props();

	const toc = $derived(buildToc(blocks));
	const idByIndex = $derived(new Map(toc.map((item) => [item.index, item.id])));

	const numbers = $derived.by(() => {
		const quiz = new Map<number, number>();
		const fill = new Map<number, number>();
		const exercise = new Map<number, number>();
		let q = 0;
		let f = 0;
		let e = 0;
		blocks.forEach((block, index) => {
			if (block.type === 'quiz') quiz.set(index, ++q);
			if (block.type === 'fill') fill.set(index, ++f);
			if (block.type === 'exercise') exercise.set(index, ++e);
		});
		return { quiz, fill, exercise };
	});
</script>

<div class="prose">
	{#each blocks as block, index}
		{#if block.type === 'h'}
			<h3 id={idByIndex.get(index)}>{block.text}</h3>
		{:else if block.type === 'p'}
			<p>{@html inline(block.md)}</p>
		{:else if block.type === 'list'}
			{#if block.ordered}
				<ol>{#each block.items as item}<li>{@html inline(item)}</li>{/each}</ol>
			{:else}
				<ul>{#each block.items as item}<li>{@html inline(item)}</li>{/each}</ul>
			{/if}
		{:else if block.type === 'code'}
			<CodeBlock code={block.code} lang={block.lang} caption={block.caption} highlight={block.highlight} {lessonId} />
		{:else if block.type === 'table'}
			<div class="table-wrap">
				<table>
					<thead><tr>{#each block.head as head}<th>{head}</th>{/each}</tr></thead>
					<tbody>
						{#each block.rows as row}
							<tr>{#each row as cell}<td>{@html inline(cell)}</td>{/each}</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if block.caption}<p class="caption">{block.caption}</p>{/if}
		{:else if block.type === 'callout'}
			<Callout tone={block.tone} title={block.title} md={block.md} />
		{:else if block.type === 'compare'}
			<CompareBlock title={block.title} python={block.python} cpp={block.cpp} note={block.note} />
		{:else if block.type === 'diff'}
			<DiffBlock title={block.title} wrong={block.wrong} right={block.right} explain={block.explain} />
		{:else if block.type === 'trace'}
			<TracePlayer
				code={block.code}
				steps={block.steps}
				lang={block.lang}
				caption={block.caption}
			/>
		{:else if block.type === 'slice'}
			<SliceViz
				string={block.string}
				start={block.start}
				stop={block.stop}
				step={block.step}
				title={block.title}
				note={block.note}
			/>
		{:else if block.type === 'memory'}
			<MemoryViz steps={block.steps} code={block.code} title={block.title} lang={block.lang} />
		{:else if block.type === 'matrix'}
			<MatrixViz
				data={block.data}
				steps={block.steps}
				title={block.title}
				rowLabels={block.rowLabels}
				colLabels={block.colLabels}
			/>
		{:else if block.type === 'quiz'}
			<Quiz
				question={block.question}
				options={block.options}
				answer={block.answer}
				explain={block.explain}
				number={numbers.quiz.get(index)}
				{lessonId}
				storageKey={`${lessonId}:q:${index}`}
			/>
		{:else if block.type === 'fill'}
			<FillExercise
				code={block.code}
				answers={block.answers}
				lang={block.lang}
				title={block.title}
				hint={block.hint}
				explain={block.explain}
				{lessonId}
			/>
		{:else if block.type === 'exercise'}
			<Exercise
				title={block.title}
				md={block.md}
				hint={block.hint}
				solution={block.solution}
				number={numbers.exercise.get(index)}
				{lessonId}
				storageKey={`${lessonId}:x:${index}`}
			/>
		{:else if block.type === 'links'}
			<div class="links">
				{#if block.title}<p class="links-title">{block.title}</p>{/if}
				{#each block.items as item}
					<a href={item.url} target="_blank" rel="noopener noreferrer">
						<Icon name="external" size={13} />
						<span>{item.label}</span>
						{#if item.note}<em>{item.note}</em>{/if}
					</a>
				{/each}
			</div>
		{/if}
	{/each}
</div>

<style>
	.caption {
		margin: 7px 2px 0;
		font-size: 12px;
		color: var(--faint);
	}

	.links {
		margin-top: 1.3rem;
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px 14px;
		border: 1px dashed var(--line);
		border-radius: 10px;
		background: var(--panel);
	}

	.links-title {
		font-size: 10.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--faint);
		margin: 0 0 2px;
	}

	.links a {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--text-2);
	}
	.links a:hover {
		color: var(--accent);
	}
	.links em {
		font-size: 11px;
		color: var(--faint);
		font-style: normal;
	}
</style>
