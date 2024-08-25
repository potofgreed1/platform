import { GambaUi, useSoundStore } from 'gamba-react-ui-v2'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { GAMES } from '../../games'
import { useUserStore } from '../../hooks/useUserStore'
import { GameSlider } from '../Dashboard/Dashboard'
import { Container, Controls, IconButton, MetaControls, Screen, Splash } from './Game.styles'
import { LoadingBar } from './LoadingBar'
import { ProvablyFairModal } from './ProvablyFairModal'
import { Scoreboard } from './Scoreboard'

function CustomError() {
  return (
    <>
      <GambaUi.Portal target="error">
        <GambaUi.Responsive>
          <h1>😭 Oh no!</h1>
          <p>Something went wrong</p>
        </GambaUi.Responsive>
      </GambaUi.Portal>
    </>
  )
}

function CustomRenderer() {
  const { game } = GambaUi.useGame()
  const [info, setInfo] = React.useState(false)
  const [provablyFair, setProvablyFair] = React.useState(false)
  const soundStore = useSoundStore()
  const firstTimePlaying = useUserStore((state) => !state.gamesPlayed.includes(game.id))
  const markGameAsPlayed = useUserStore((state) => () => state.markGameAsPlayed(game.id, true))
  const [ready, setReady] = React.useState(false)

  React.useEffect(
    () => {
      const timeout = setTimeout(() => {
        setReady(true)
      }, 750)
      return () => clearTimeout(timeout)
    },
    [],
  )

  React.useEffect(
    () => {
      const timeout = setTimeout(() => {
        setInfo(firstTimePlaying)
      }, 1000)
      return () => clearTimeout(timeout)
    },
    [firstTimePlaying],
  )

  const closeInfo = () => {
    markGameAsPlayed()
    setInfo(false)
  }

  return (
    <>
      {info && (
        <Modal onClose={() => setInfo(false)}>
          <h1>
            <img height="100px" title={game.meta.name} src={game.meta.image} />
          </h1>
          <p>{game.meta.description}</p>
          <GambaUi.Button main onClick={closeInfo}>
            Play
          </GambaUi.Button>
        </Modal>
      )}
      {provablyFair && (
        <ProvablyFairModal onClose={() => setProvablyFair(false)} />
      )}
      <Container>
        <Screen>
          <Splash>
            <img height="150px" src={game.meta.image} />
          </Splash>
          <GambaUi.PortalTarget target="error" />
          {ready && <GambaUi.PortalTarget target="screen" />}
          <MetaControls>
            <IconButton onClick={() => setInfo(true)}>
              <Icon.Info />
            </IconButton>
            <IconButton onClick={() => setProvablyFair(true)}>
              <Icon.Fairness />
            </IconButton>
            <IconButton onClick={() => soundStore.set(soundStore.volume ? 0 : .5)}>
              {soundStore.volume ? <Icon.Volume /> : <Icon.VolumeMuted />}
            </IconButton>
          </MetaControls>
        </Screen>
        <LoadingBar />
        <Controls>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GambaUi.PortalTarget target="controls" />
              <GambaUi.PortalTarget target="play" />
            </div>
          </div>
        </Controls>
        <Scoreboard />
      </Container>
    </>
  )
}

export default function Game() {
  const { gameId } = useParams()
  const game = GAMES.find((x) => x.id === gameId)

  return (
    <>
      {game ? (
        <GambaUi.Game
          game={game}
          errorFallback={<CustomError />}
          children={<CustomRenderer />}
        />
      ) : (
        <h1>Game not found! 👎</h1>
      )}
      <GameSlider />
    </>
  )
}
