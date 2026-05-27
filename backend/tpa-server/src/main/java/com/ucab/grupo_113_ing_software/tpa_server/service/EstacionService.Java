@Service
public class EstacionService {
    private final EstacionRepository estacionRepository;

    public EstacionService(EstacionRepository estacionRepository) {
        this.estacionRepository = estacionRepository;
    }
    @Autowired
    public EstacionService(EstacionRepository estacionRepository) {
        this.estacionRepository = estacionRepository;
    }
public Estacion crearEstacion(Estacion estacion) {
        return estacionRepository.save(estacion);
    }

    public List<Estacion> getAllEstaciones() {
        return estacionRepository.findAll();
    }

public Estacion eliminarEstacion(Long id) {
    Estacion estacion = estacionRepository.findById(id).orElse(null);
    if (estacion != null) {
        estacionRepository.deleteById(id);
    }
    return estacion;
}
}